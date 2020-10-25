const { Plugin } = require('powercord/entities');

class UserIDInfo extends Plugin {
    startPlugin() {
        powercord.api.commands.registerCommand({
            command: 'userid',
            aliases: ['useridinfo','idinfo'],
            label: 'UserID Info',
            usage: '{c} <id>',
            executor: (id) => {
                return this.getInfo(id)
            }
        })
    }

    async getInfo(id) {
        try {
        let userObject = await (await require('powercord/webpack').getModule(['acceptAgreements','getUser'])).getUser(String(id));
        let userName = userObject['username']+'#'+userObject['discriminator'];
        let avatarURL = userObject['avatarURL'];
        let isBot = String(userObject['bot']);
        let resultText = 'ID = '+id+'\nUsername = '+userName+'\nAvatar = '+avatarURL+'\nBot = '+isBot;
        const embed = {
            type: 'rich',
            title: `UserID Lookup`,
            description: resultText
        }
        return {
               result:embed,
               embed:true
        }
    }
    catch(err) {
        return {result:'Incorrect UserID.'}
    }
    }

    pluginWillUnload() {
        powercord.api.commands.unregisterCommand('userid');
    }
}

module.exports = UserIDInfo;
