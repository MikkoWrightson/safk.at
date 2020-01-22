module.exports = {
    cleanUp: function(thedata) {
        let finalData = [];
        let datanew = thedata;
        datanew = datanew.split('\n');
        let foundIndex = -1;
        for(let i = 0; i<datanew.length; i++) {
            if(datanew[i].includes('<div class="view-ruokalista">')) {
                foundIndex = i;
            }
        }
        let new_arr = [];
        if(foundIndex != -1) {
            for(let i = foundIndex; i<foundIndex + 100; i++) {
                new_arr.push(datanew[i]);
            }
        }
        let foundIndexAgain = -1;
        for(let i = 0; i<new_arr.length; i++) {
            if(new_arr[i].includes('</section>')) {
                foundIndexAgain = i;
                break;
            }
        }
        for(let i = 0; i<foundIndexAgain; i++) {
            new_arr[i] = new_arr[i].split("<").join("\n<");
        }

        for(let i = 0; i<foundIndexAgain; i++) {
            new_arr[i] = new_arr[i].split('<div class="views-row">').join("");
            new_arr[i] = new_arr[i].split('</div>').join("");
        
        }

        new_arr = new_arr[0].split("\n");
        
        new_arr = new_arr.slice(0, -7);
        new_arr.splice(0, 2);

        let curSection = -1;
        let ongoingSection = false;
        let longest = 0;
        for(let i = 0; i<new_arr.length; i++) {
            if(new_arr[i].includes("<h3>")) {
                longest = 0;
                ongoingSection = true;
                curSection++;
                finalData[curSection] = {
                    header: "",
                    contents: []
                };
            }
            if(curSection > -1) {
                let shouldAdd = true;
                if(new_arr[i].includes("</h3>")) {
                    ongoingSection = false; 
                    shouldAdd = false;
                }
                if(shouldAdd) {
                    if(ongoingSection == true) {
                        let data = new_arr[i].replace("<h3>", "");
                        if(data.length > finalData[curSection].longest)
                            finalData[curSection].longest = data.length;
                        if(data.length > longest) 
                            longest = data.length;
                        finalData[curSection].header += data;
                    } else {
                        let data = new_arr[i];
                        if(data.length > finalData[curSection].longest) {
                            finalData[curSection].longest = data.length;
                        }

                        if(data.length > longest) 
                            longest = data.length;

                        if(data.length > 2) {
                            finalData[curSection].contents.push(new_arr[i]);
                        }
                    }
                }
                
            }
                
        }
        return {"data": finalData, "longest": longest};
    }
}