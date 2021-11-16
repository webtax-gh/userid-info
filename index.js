const { Plugin } = require('powercord/entities');
const { React, getModule, messages, channels } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector');
const { findInReactTree, getOwnerInstance } = require('powercord/util');


class UserIDInfo extends Plugin {
	async startPlugin() {
		powercord.api.commands.registerCommand({
			command: 'userid',
			aliases: ['useridinfo', 'idinfo'],
			label: 'UserID Info',
			usage: '{c} <id>',
			description: 'Lookup user info from a user id',
			executor: (id) => {
				if (id.toString().includes('@')) {
					id = id.toString().split('!').pop().split('>')[0]
				}
				return this.getInfo(id)
			}
		})

		const Menu = await getModule(['MenuItem']);
		inject('user-info', Menu, 'default', (args) => {
			const [{ navId, children }] = args;
			if (navId !== 'user-context') {
				return args;
			}

			const hasUserInfo = findInReactTree(children, child => child.props && child.props.id === 'get-user-info');
			if (!hasUserInfo) {
				let user;

				if (document.querySelector('#user-context')) {
					const instance = getOwnerInstance(document.querySelector('#user-context'));
					user = (instance?._reactInternals || instance?._reactInternalFiber)?.return?.memoizedProps?.user;
				}

				if (!user) {
					return args;
				}
				console.log(user.id)
				const getUserInfo = React.createElement(Menu.MenuItem, {
					id: 'get-user-info',
					label: 'User Info',
					action: () => messages.receiveMessage(channels.getChannelId(), { content:'some how need to send embed' })

				});

				const devmodeItem = findInReactTree(children, child => child.props && child.props.id === 'devmode-copy-id');
				const developerGroup = children.find(child => child.props && child.props.children === devmodeItem);
				if (developerGroup) {
					if (!Array.isArray(developerGroup.props.children)) {
						developerGroup.props.children = [developerGroup.props.children];
					}

					developerGroup.props.children.push(getUserInfo);
				} else {
					children.push([React.createElement(Menu.MenuSeparator), React.createElement(Menu.MenuGroup, {}, getUserInfo)]);
				}
			}

			return args;
		}, true);

		Menu.default.displayName = 'Menu';

	}

	async getInfo(id) {
		try {
			let userObject = await (await require('powercord/webpack').getModule(['acceptAgreements', 'getUser'])).getUser(String(id));
			let userName = userObject['username'] + '#' + userObject['discriminator'];
			let avatarURL = 'https://cdn.discordapp.com/avatars/' + id + '/' + userObject['avatar'];
			let isBot = String(userObject['bot']);
			let unixTime = Math.round(((id / 4194304) + 1420070400000) / 1000); // Converts to Discord unix timestamp
			const embed = {
				type: 'rich',
				color: userObject["accentColor"],
				author: {
					name: userName,
					url: `discord://-/users/${id}`,
					icon_url: avatarURL,
					proxy_icon_url: avatarURL,
				},
				thumbnail: {
					url: avatarURL,
					proxy_url: avatarURL,
					height: 128,
					width: 128
				},
				fields: [{
					name: 'ID',
					value: `\`${id}\``,
					inline: true
				}, {
					name: 'Username',
					value: userName + ` (<@${id}>)`,
					inline: false
				}, {
					name: 'Bot',
					value: `${isBot}`,
					inline: false
				}, {
					name: 'Avatar',
					value: `[Link](${avatarURL})`,
					inline: true
				}, {
					name: 'Account Created',
					value: `<t:${unixTime}:f> (<t:${unixTime}:R>)`,
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
		uninject('user-info')
	}
}
module.exports = UserIDInfo;
