const express = require('express');
const osmosis = require('osmosis');
const puppeteer = require('puppeteer');
//const sizeof = require('object-sizeof');
const util = require('./util');

const router = new express.Router();

const Cache = require('./cache');
const cacheInst = new Cache();

router.get('/', (req, res) => {
    osmosis
    .get('https://www.campusravita.fi/fi/ravintolat-ja-kahvila')
    .find('.view-ruokalista')
    .set({
        headers: ['h3'],
        everything: ['h3, div.views-row']
    })
    .data(content => {
        //debug data
        //content.headers = ["aa", "aaa", "aaaa", "aaaaa", "aaaa aaaa"];
        //content.everything = ["aa", "kysta", "asdfasfdasdf", "aaa", "mitä", "asdfasdfasdfasdf", "hehe", "aaaa", "juju", "jaja", "jooo", "aaaaa", "heheheh", "hehehehehheee", "heheheheee", "aaaa aaaa", "huuu", "haaa"];

        
        if(util.showWebsite(req.device.type)) {
            res.render('index', {content: content});
        } else {
            res.send(content.headers.length > 0 ? util.cleanMenu(content) : "No menu available.\n");
        }
    });
    
});

router.get('/:class', cacheInst.seekExistingPlan, async (req, res) => {
    const luokka = req.params.class;
    const DELAY_TIME = 500;
    try {
        let days = [];
        let browser;
        let page;
        if(req.existingData) {
            days = req.existingData;
        } else {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            page = await browser.newPage();
            await page.goto("https://lukkarit.tamk.fi");
            await page.type("#sgrp", luokka);
            await page.click("#groupSearchForm fieldset center input");
    
            let iterations = 0;
            while(days.length < 1 && iterations < 5) {
                await util.delay(DELAY_TIME);
                days = await page.evaluate(() => {
                    const cols = document.querySelectorAll(".cl-colevents");
                    let ret = [];
                    cols.forEach(function(col, i) {
                        ret[i] = {};
                        ret[i].longest = 27;
                        const day = cols[i].getAttribute("clday");
                        ret[i].day = day;
                        ret[i].events = [];
                        const events = cols[i].querySelectorAll(".cl-event");
                        events.forEach(function(event, j) {
                            const eventTime = events[j].querySelector("dt").innerHTML;
                            let eventInfo = events[j].querySelector("dd").innerHTML.replace("<b>", "")
                                .replace("</b>", "")
                                .replace("<p>", "")
                                .replace("</p>", "")
                                .split("<br>")
                                .filter(function(a) {
                                    return a != null && a.length > 1;
                                });
                            eventInfo.forEach(function(e, index) {
                                if(e.length > 25) {
                                    eventInfo[index] = e.substring(0, 25);
                                    eventInfo[index] += ".."; 
                                }
                            });
                            
                            ret[i].events.push({time: eventTime, info: eventInfo});
                        });
                    });
                    return ret;
                });
                iterations++;
            } 
            await page.close();
            await browser.close();
        }
        

        if(days && days != [] && days.length > 1) {
            if(!req.existingData) 
                cacheInst.saveData(luokka, days);

            if(util.showWebsite(req.device.type)) {
                res.render('sched', {content: days});
            } else {
                const cleaned = util.cleanSchedule(days);
                res.send(cleaned);
            }
        } else {
            if(util.showWebsite(req.device.type)) {
                res.render('sched', {content: []});
            } else 
                res.send("Request timed out. Did you use the correct class ID?\n");
        }
    } catch(e) {
        if(page)
            await page.close();
        if(browser)
            await browser.close();
            
        console.log(e);
        res.status(500).send('Something went wrong.')
    }
    
});

module.exports = router;