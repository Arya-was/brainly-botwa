const { default: MakeWaConnect, useMultiFileAuthState, DisconnectReason, fetchLatestVersion} = require('@adiwajshing/baileys')
const  { smsg } = require('./lib/msg')
const { Boom } = require("@hapi/boom");
process.on('uncaughtException', console.error)

async function start() {
    //connecttion
    let session = await useMultiFileAuthState(`./session-multi`)
    const client = MakeWaConnect({
        printQRInTerminal: true,
        markOnlineOnConnect: true,
        browser: ['Telegram BOT','Chrome','1.0.0'],
        auth: session.state
    })
    client.ev.on('creds.update', session.saveCreds)
    client.ev.on('connection.update', async(update) => {
		const { lastDisconnect, connection } = update;
		if (connection) console.log("Connecting to the WhatsApp bot...")
		if (connection == "connecting")
			console.log("Connecting to the WhatsApp bot...");
		if (connection) {
			if (connection != "connecting")
				console.log("Connection: " + connection)
		}
		if (connection == "open")
			console.log("Successfully connected to whatsapp");

		if (connection === "close") {
			let reason = new Boom(lastDisconnect.error).output.statusCode;
			if (reason === DisconnectReason.badSession) {
				console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
				client.logout();
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection closed, reconnecting....");
				run();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection Lost from Server, reconnecting...");
				run();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
				client.logout();
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`);
				client.logout();
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				start();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnecting...");
				run();
			} else {
				client.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
			}
		}
	})
	//Chat Info
    client.ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`))
    client.ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`))
    client.ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`))

	//Message
	client.ev.on('messages.upsert', async (chat) => {
        try {
            const m = chat.messages[0]
            const msg = smsg(client, m, chat)
            require('./handler')(client, msg)
        } catch (e) {
            console.log(e)
        }
    })
}
start()