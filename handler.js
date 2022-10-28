const baileys = require('@adiwajshing/baileys')
const { Brainly } = require("brainly-scraper-v2");
const brain = new Brainly("us"); //Ganti Sesuai Negara Hosting lu
var data;

module.exports = index = async(client, msg) => {
    try {
        const body = (msg.mtype === 'conversation') ? msg.message.conversation : (msg.mtype == 'imageMessage') ? msg.message.imageMessage.caption : (msg.mtype == 'videoMessage') ? msg.message.videoMessage.caption : (msg.mtype == 'extendedTextMessage') ? msg.message.extendedTextMessage.text : (msg.mtype == 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : (msg.mtype == 'listResponseMessage') ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : (msg.mtype == 'templateButtonReplyMessage') ? msg.message.templateButtonReplyMessage.selectedId : (msg.mtype === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId || msg.text) : ''
        if(msg.fromMe) return
        console.log(body)
        if ('/start'.includes(body)) {
            let txt = `\n\n*Selamat Datang ${msg.pushName}!*\n⁉️ Bagaimana cara menggunakannya? Kamu hanya perlu menuliskan pertanyaannya saja dan kirimkan ke bot ini... Nantinya bot akan mencari jawaban dari pertanyaan tersebut di Brainly (http://brainly.co.id/)!`
            const template = baileys.generateWAMessageFromContent(msg.chat, baileys.proto.Message.fromObject({
                viewOnceMessage: {
                    message:{
                        templateMessage:{
                            hydratedTemplate:{
                                hydratedContentText: txt,
                                hydratedFooterText: "Create By Arya With ☕",
                                hydratedButtons: [{
                                    urlButton:{
                                        displayText: "Follow IG Owner Kuu",
                                        url: 'https://www.instagram.com/arya_dwd/'
                                    }
                                }]
                            }
                        }
                    }
                }
            }), { quoted: msg})
            return client.relayMessage(msg.chat, template.message, { messageId: template.key.id })
        } else if ('/next'.includes(body)) {
            try { 
            data.ke++;
            const template = baileys.generateWAMessageFromContent(msg.chat, baileys.proto.Message.fromObject({
                viewOnceMessage: {
                    message:{
                        templateMessage:{
                            hydratedTemplate:{
                                hydratedContentText: makeText(data),
                                hydratedFooterText: "Create By Arya With ☕",
                                hydratedButtons: [{
                                    quickReplyButton:{
                                        displayText: "➡ Next",
                                        id: '/next'
                                    }
                                }]
                            }
                        }
                    }
                }
            }), { quoted: msg})
            return client.relayMessage(msg.chat, template.message, { messageId: template.key.id })
            } catch(e) {
                client.sendMessage(msg.chat, { text: "Upss... Pertanyaan selanjutnya tidak ditemukan!"})
            }
        } else {
            client.sendMessage(msg.chat, { text: "🔍 Sedang Mencari..." }).then((xx) => {
                brain.search(body, "id").then((x) => {
                    if (x.length === 0) {
                        client.sendMessage(msg.chat, { text: "👀 Tidak ditemukan jawaban apapun! coba cari menggunakan kata kunci lain!" })
                    } else {
                        data = {
                            q: body,
                            a: x,
                            ke: 0
                        }
                        const template = baileys.generateWAMessageFromContent(msg.chat, baileys.proto.Message.fromObject({
                            viewOnceMessage: {
                                message:{
                                    templateMessage:{
                                        hydratedTemplate:{
                                            hydratedContentText: makeText(data),
                                            hydratedFooterText: "Create By Arya With ☕",
                                            hydratedButtons: [{
                                                quickReplyButton:{
                                                    displayText: "➡ Next",
                                                    id: '/next'
                                                }
                                            }]
                                        }
                                    }
                                }
                            }
                        }), { quoted: msg})
                        return client.relayMessage(msg.chat, template.message, { messageId: template.key.id })
                        }
                            })
                        })
        }

        
        function inlinearr(n, max) {
            return n >= 1 ? n == parseInt(max-1) ? ['⬅ Back'] : ['⬅ Back', '➡ Next'] : ['➡ Next']
          }

        //Function Brainly
        function makeText(data, type = "jawaban") {
              if(data.a) {
                let jawaban = data.a[data.ke].answers[0];
                return `${data.a[data.ke].question.content > 2048 ? data.a[data.ke].question.content.slice(0, 2048) + `... dan ${data.a[data.ke].question.content - 2048} karakter lagi.` : data.a[data.ke].question.content}\n\n✋ Terdapat ${data.a[data.ke].answers.length} Jawaban! Berikut kami tampilkan jawaban teratas:\n\n*${jawaban.content.length > 1024 ? jawaban.content.slice(0, 1024) + `... dan ${jawaban.content.length - 1024} karakter lagi.` : jawaban.content}*\n\n${jawaban.isBest? "🌟 Best\n" : ""}👤 Rank Penjawab: ${jawaban.author? jawaban.author.rank? jawaban.author.rank : "Tidak Diketahui" : "Tidak Diketahui"}\n🔗 https://brainly.co.id/tugas/${data.a[data.ke].question.id}\n🔢 ${data.ke + 1}/${data.a.length}`
              } else {
                return `Tidak ditemukan jawaban apapun.`
              }
          }
    } catch (e) {
        console.log(e)
    }
}
