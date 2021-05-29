const { Plugin } = require('powercord/entities');

class UserIDInfo extends Plugin {
    startPlugin() {
        powercord.api.commands.registerCommand({
            command: 'userid',
            aliases: ['useridinfo', 'idinfo'],
            label: 'UserID Info',
            usage: '{c} <id>',
            description: 'Lookup user info from a user id',
            executor: (id) => {
                return this.getInfo(id)
            }
        })
    }

    async getInfo(id) {
        try {
            let userObject = await (await require('powercord/webpack').getModule(['acceptAgreements', 'getUser'])).getUser(String(id));
            let userName = userObject['username'] + '#' + userObject['discriminator'];
            let avatarURL = 'https://cdn.discordapp.com/avatars/' + id + '/' + userObject['avatar'];
            let isBot = String(userObject['bot']);
            let unixTime = (id / 4194304) + 1420070400000;
            let jsTime = new Date(unixTime);
            let humanTime = (jsTime.getMonth()+1) + '/' + jsTime.getDate() + '/' + jsTime.getFullYear();
            function timeDifference(current,previous){var msPerMinute=60*1000;var msPerHour=msPerMinute*60;var msPerDay=msPerHour*24;var msPerMonth=msPerDay*30;var msPerYear=msPerDay*365;var elapsed=current-previous;if(elapsed<msPerMinute){return Math.round(elapsed/1000)+' seconds ago'}else if(elapsed<msPerHour){return Math.round(elapsed/msPerMinute)+' minutes ago'}else if(elapsed<msPerDay){return Math.round(elapsed/msPerHour)+' hours ago'}else if(elapsed<msPerMonth){return 'approximately '+Math.round(elapsed/msPerDay)+' days ago'}else if(elapsed<msPerYear){return 'approximately '+Math.round(elapsed/msPerMonth)+' months ago'}else{return 'approximately '+Math.round(elapsed/msPerYear)+' years ago'}}
            let currentTime = Date.now();
            let relativeTime = timeDifference(currentTime,unixTime)
            const embed = {
                type: 'rich',
                title: `UserID Lookup for ${userName}`,
                fields: [{
                    name: 'ID',
                    value: `${id}`,
                    inline: false
                }, {
                    name: 'Tag',
                    value: `<@${id}>`,
                    inline: false
                }, {
                    name: 'Username',
                    value: userName,
                    inline: false
                }, {
                    name: 'Bot',
                    value: `${isBot}`,
                    inline: false
                }, {
                    name: 'Avatar',
                    value: avatarURL,
                    inline: false
                }, {
                    name: 'Created',
                    value: humanTime+' (' +relativeTime+')',
                    inline: false
                }]
            }
            return {
                result: embed,
                embed: true
            }
        } catch (err) {
            return {
                result: 'Incorrect UserID.'
            }
        }
    }

    pluginWillUnload() {
        powercord.api.commands.unregisterCommand('userid');
    }
}

module.exports = UserIDInfo;
