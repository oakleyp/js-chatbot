"use strict";

class ChatBot {
    
    /* A ChatBot instance can be initialized using the following parameters:
     * name ---------- The display name of the bot in chat, defaults to "Deaf Siri"
     * avatar_url ---- URL of the bot's avatar image in chat, defaults to nick cage
     * features ------ A list of commands available to the bot, defaults to all
     * containerdiv -- The DOM element node of class "chatbot" that will serve as the context for input and output 
     * logmode ------- Enables or disables logging to the console, defaults to 3, with the following modes available:
     *          [Mode]
     *              3: All logs enabled
     *              2: Only warnings and errors will be logged
     *              1: Only errors will be logged
     *              0: All logs disabled
     */
    
    constructor(name=null, avatar_url=null, features = null, containerdiv, logmode=3) {
        this.name = name;
        this.features = features;
        this.avatar_url = avatar_url;
        this.logmode = logmode
        
        this.protocol = (location.protocol == 'http:') ? "http:" : "https:";
        
        if(avatar_url == null)
            this.avatar_url = "http://www.placecage.com/g/200/300";
        
        if(features == null) 
            this.features = ['@help', '@temp', '@weather', '@gh', '@etsy', '@es', '@fr', '@giphy', '@bg', '@whatis', '@wiki'];
        
        if(name == null) 
            this.name = "Deaf Siri";
        
        this.containerdiv = containerdiv;
        this.inputDiv = this.containerdiv.getElementsByClassName("inputbox")[0];
        this.displayDiv = this.containerdiv.getElementsByClassName("displaybox")[0];
        
        this.helptext = [
            "@help [command]: Replies with this help text if no command specified; otherwise, displays help and info specific to a given command keyword.",
            "@temp [zipcode]: Displays the current temperature of Durham, NC by default. Otherwise, displays the temperature in a given zip code.",
            "@weather [zipcode]: Replies with the current weather information in Durham, NC by default. Otherwise, displays the weather for a given zip code.",
            "@gh [user]: Replies with information from the github page of a specified user.",
            "@etsy [search]: Replies with the top few listings for a given search.",
            "@es [text]: Replies with a spanish translation for the given english text.",
            "@fr [text]: Replies with a french translation for the given english text.",
            "@giphy: Replies with a random gif image.",
            "@whatis [word]: Replies with the definition of a given word.",
            "@wiki [query]: Replies with a link to the wikipedia page matching a given query."
        ];
        
        this.apikeys = {
            "openweathermap":"7ffc48c18a204e3b84a40a280a297488",
        }
        
        if(this.logmode == 3) 
            console.log(`ChatBot initialized -- name: ${this.name}; features: ${this.features.join(", ")}; container content: ${this.containerdiv.innerHTML}`);
    }
    
    log(classtype, sender, message, dir = null) {
        if(this.enablelog > 0) {
            if(this.logmode == 3 && classtype == "Info") {
                console.log(`ChatBot (${this.name}) - Info in ${sender}: ${message}`);
                if(dir!=null) console.dir(dir);
            }
            if(this.logmode >= 2 && classtype == "Warning") {
                console.warn(`ChatBot (${this.name}) - Warning in ${sender}: ${message}`);
                if(dir!=null) console.dir(dir);
            }
            if(this.logmode >= 1 && classtype == "Error") {
                console.error(`ChatBot (${this.name}) - Error in ${sender}: ${message}`);
                if(dir!=null) console.dir(dir);
            }
                
        }
    }
    
    //Returns json results array given url to fetch if response code is 200, otherwise returns null
    getFetchJSON(url) {
        fetch(url)
         .then(function (response) {
            if(response.status != 200) {
                this.log("Error", "getFetchJSON()", "Could not fetch data given url: " + url + " | query returned: " + response.responseText);
                return null;
            } else {
                response.json().then(function (results) {
                   return results;                  
                });
            }
        });
    }
    
    getDefaultResponse(input) {
        return "If that was a command, I have no idea what to do with it. Here is a list of available commands:<br><br> " + this.helptext.join("<br><br>");
    }
    
    getHelpResponse(input) {
        this.log("Info", "getHelpResponse()", "Getting help response for input: " + input);
        let cleanput = input.replace("@help", "").trim();
        let commands = this.features;
        for(var i = 0; i < commands.length; i++) {
            if(cleanput.includes(commands[i])) {
                switch(commands[i]) {
                    case "@help":
                        return this.helptext[0];
                    case "@temp":
                        return this.helptext[1];
                    case "@weather":
                        return this.helptext[2];
                    case "@gh":
                        return this.helptext[3];
                    case "@etsy":
                        return this.helptext[4];
                    case "@es":
                        return this.helptext[5];
                    case "@fr": 
                        return this.helptext[6];
                    case "@giphy":
                        return this.helptext[7];
                    case "@whatis":
                        return this.helptext[8];
                    case "@wiki":
                        return this.helptext[9];
                    default: 
                        continue;
                        
                }
            }
        }
        
        //No command keyword specified, print all help
        return (this.helptext.join("<br><br>"));
        
    }
    
    //Returns degrees farhenheit given degrees kelvin
    getDegFahrenheit(degKelvin) {
        let result = parseInt(degKelvin);
        result = Math.round(result * 9/5 - 459.67);
        result = result + "&#8457;"
        return result;
    }
    
    //Returns a response with the current temperature, using the openweathermap api, documented here:
    // https://openweathermap.org/current
    getTemp(input) {
        let cleanput = input.replace("@temp", "").trim();
        let zip = "27701"
        if(cleanput.length == 5 && !isNaN(parseInt(cleanput))) zip = cleanput;
        
        let response = `The current temperature for zipcode ${zip} is `;
        
        let results = this.getFetchJSON(`${this.protocol}//api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${this.apikeys["openweathermap"]}`);
        if(results != null) {
            response += `${this.getDegFahrenheit(results["main"]["temp"])}, with a high of ${this.getDegFahrenheit(results["main"]["temp_max"])} and a low of ${this.getDegFahrenheit(results["main"]["temp_min"])}`;
            return response;
        } else return "Couldn't get temp for zipcode (" + zip + "), check the browser console for more details.";
    }
    
    getResponse(input) {
        this.log("Info", "getResponse()", "Getting response for input: " + input);
        let commands = this.features;
        for(var i = 0; i < commands.length; i++) {
            if(input.includes(commands[i])) {
                switch(commands[i]) {
                    case "@help":
                        return this.getHelpResponse(input);
                    case "@temp":
                        return this.getTemp(input);
                    case "@weather":
                        break;
                    case "@gh":
                        break;
                    case "@etsy":
                        break;
                    case "@es":
                        break;
                    case "@fr":
                        break;
                    case "@giphy":
                        break;
                    case "@whatis":
                        break;
                    case "@wiki":
                        break;
                        
                }
            }
        }
        
        //Get default response if have not already returned at this point
        return this.getDefaultResponse(input);
    }
    
    printResponse(text) {
        appendMessage("bot", this.name, this.avatar_url, text, this.containerdiv);
    }
    
    
    input(text) {
        let responseText = this.getResponse(text);
        this.printResponse(responseText);
    }
    
    getElement(etype) {
        switch(etype) {
            case "input":
                return this.inputDiv;
            case "display":
                return this.displayDiv;
        }
    }
}
