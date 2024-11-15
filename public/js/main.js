const sendButton = document.querySelector(`#sendButton`);
const sendImageButton = document.querySelector(`.sendImage`);
const chat_box = document.querySelector(`.messages`);
const text_inp = document.querySelector(`#textInput`);
const timestamp = new Date().toLocaleString();


let db;
const request = indexedDB.open("ChatDatabase", 3);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("text", "text", { unique: false });
    objectStore.createIndex("timestamp", "timestamp", { unique: false });
    objectStore.createIndex("from", "from", { unique: false });
    objectStore.createIndex("type", "type", { unique: false });
    objectStore.createIndex("src", "src", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database opened successfully");
    loadMessages();
};

request.onerror = function (event) {
    console.error("Database error:", event.target.errorCode);
};


window.addEventListener(`load`, () => {
    getNewMessages("reminder");
    getNewMessages("dr_blom");
    setInterval(() => {
        getNewMessages("reminder");
    }, 60 * 60 * 1000);
})


const commandButton = document.querySelector(`#commandButton`);
const commandBox = document.querySelector(`.commandBox`);
commandButton.addEventListener(`click`, () => {
    commandBox.classList.toggle(`openCommand`)
    commandBox.classList.toggle(`closeCommand`)
})


sendButton.addEventListener(`click`, () => sendMessage("user", text_inp.value));
sendImageButton.addEventListener(`click`, () => sendImage("user"));
document.body.addEventListener(`keydown`, (e) => {
    if (e.keyCode === 13) {
        sendMessage("user", text_inp.value);
    }
});


const sendInlineKeyboardData = (e) => {
    const callbackText = e.target.getAttribute('data-callback');
    const messageId = e.target.closest('.message').getAttribute(`data-message-id`);
    const messageText = e.target.closest('.message').innerHTML.trim();
    const plantName = e.target.getAttribute('data-plant-name');


    if (messageId) {
        // ارسال داده‌ها به سرور
        const formData = new FormData();
        console.log(callbackText)
        formData.append('callbackText', callbackText);
        formData.append('messageId', messageId);
        formData.append('messageText', messageText);
        formData.append('plant_name', plantName);

        // ارسال درخواست با axios
        axios.post('http://localhost:3000/InlineKeyboard', formData).then(answer => {

            if (answer.data.arguments.action === "send") {
                // اگر جواب "send" بود، ارسال پیام جدید
                sendMessage('bot', answer.data.arguments.text);
            } else if (answer.data.arguments.action === "edit") {
                // اگر جواب "edit" بود، ویرایش پیام موجود
                Array.from(document.querySelector('.messages').children).forEach(message => {
                    if (message.getAttribute('data-message-id') === answer.data.arguments.message_id.toString()) {
                        const inlineKeyboard = answer.data.arguments.inlineKeyboard !== undefined ? answer.data.arguments.inlineKeyboard : " ";
                        message.innerHTML = `${answer.data.arguments.text}${inlineKeyboard}`;
                        scrollToBottom()
                        updateMessageTextById(+answer.data.arguments.message_id, answer.data.arguments.text + inlineKeyboard);
                    }
                });
            } else if (answer.data.arguments.action === "delete") {
                console.log(answer.data.arguments.message_id)
                updateMessageTextById(+answer.data.arguments.message_id, "", ()=>{
                    e.target.parentElement.parentElement.parentElement.classList.add(`deletedMessage`)
                    setTimeout(() => {
                        e.target.parentElement.parentElement.parentElement.remove()
                    }, 300);
                });
                // const elem = e.target
                // const elemId = elem.parentElement.parentElement.parentElement.getAttribute(`data-message-id`)
                // console.log(`id: `, +elemId)

            }
        }).catch(error => {
            console.error('Error sending inline keyboard data:', error);
        });
    } else {
        console.error('messageId is missing!');
    }
};


const saveMessageToDB = (messageText, from, type, src = null, cb) => {
    const transaction = db.transaction(["messages"], "readwrite");
    const objectStore = transaction.objectStore("messages");

    const message = {
        text: messageText,
        from: from,
        timestamp: new Date().toISOString(),
        type: type,
        src: src
    };

    const request = objectStore.add(message);

    request.onsuccess = function (e) {
        cb(e.target.result)
    };

    request.onerror = function () {
        console.error("Error saving message to IndexedDB");
    };
};

const setInlineKeyboardsStyle = (message) => {
    try {
        if (message.lastElementChild.classList.contains(`inline_keyboard_rows`) || message.children[message.children.length - 2].classList.contains(`inline_keyboard_rows`)) {
            console.log(`styling`)
            message.style.marginBottom += message.querySelector(`.inline_keyboard_rows`).clientHeight + `px`
        }
    } catch (err) { }
}

const loadMessages = () => {
    const transaction = db.transaction(["messages"], "readonly");
    const objectStore = transaction.objectStore("messages");

    const request = objectStore.getAll();
    request.onsuccess = function (event) {
        const messages = event.target.result;

        messages.forEach(message => {
            if(message.text.trim() !== ""){
                const { text, from, timestamp, type, src } = message;
                const message_class = from === "bot" ? "bot-message" : "user-message"
    
                if (type === "text") {
                    // نمایش پیام متنی
                    chat_box.insertAdjacentHTML(`beforeend`, `
                        <div dir="rtl" data-message-id="${message.id}" class="${message_class} message bg-blue-500 text-white p-2 rounded-lg mb-2 text-xs w-2/3 shadowed">
                            <p>${text}</p>
                        </div>
                    `);
                    setInlineKeyboardsStyle(chat_box.lastElementChild)
                } else if (type === "photo") {
                    // نمایش پیام تصویری
                    chat_box.insertAdjacentHTML(`beforeend`, `
                        <div dir="rtl" data-message-id="${message.id}" class="${message_class} message bg-blue-500 text-white p-2 rounded-lg mb-2 text-xs w-2/3 shadowed">
                            <img src="${src}" alt="Image" class="rounded-lg mb-2" style="max-width: 100%; height: auto;">
                        </div>
                    `);
                }
            }
        });
        scrollToBottom();
    };

    request.onerror = function () {
        console.error("Error loading messages from IndexedDB");
    };
    scrollToBottom()
    const messages = document.querySelectorAll(`.bot-message`)
    messages.forEach(message => {
        setInlineKeyboardsStyle(message)
    })
};

const sendMessage = (from, text) => {
    if (text.length > 0 && text.trim() !== "") {
        const message_class = from === "bot" ? "bot-message" : "user-message";

        // ذخیره پیام در IndexedDB
        saveMessageToDB(text, from, "text", null, async (messageId) => {
            console.log(messageId)

            // ایجاد پیام با data-message-id
            const messageHTML = `
                <div dir="rtl" data-message-id="${messageId}" class="${message_class} message bg-blue-500 text-white p-2 rounded-lg mb-2 text-xs w-2/3 shadowed">
                    <p>${text}</p>
                </div>
            `;

            // اضافه کردن پیام به DOM
            chat_box.insertAdjacentHTML('beforeend', messageHTML);

            // پاک کردن ورودی پیام
            text_inp.value = '';

            // اسکرول به پایین
            setInlineKeyboardsStyle(chat_box.lastElementChild)
            scrollToBottom();
        });
    }
};


const sendImage = (from) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // فقط فایل‌های تصویری
    input.onchange = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append("image", file);

        axios.post(`/uploadImage`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((result) => {
            const imageUrl = result.data.src;
            saveMessageToDB(imageUrl, from, "photo", imageUrl, (e) => {
                chat_box.insertAdjacentHTML(`beforeend`, `
                        <div dir="rtl" class="user-message message bg-blue-500 text-white p-2 rounded-lg mb-2 text-xs w-2/3 shadowed">
                            <img src="${imageUrl}" data-message-id="${e}" alt="Image" class="rounded-lg mb-2" style="max-width: 100%; height: auto;">
                        </div>
                    `);
                input.value = null;
                scrollToBottom()


                const formData2 = new FormData();
                formData2.append("image", file);
                formData2.append("messageId", e);
                formData2.append("imageUrl", result.data.src);

                axios.post(`/answereImage`, formData2, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((response) => {
                    console.log(response.data.api_status)
                    let bot_answer_text;
                    if (!response.data.api_status) {
                        bot_answer_text = `                
                                🌵 اسم رایج گیاه: ${response.data.bot_message.common_name} <br>
                                📋 نام علمی گیاه:  ${response.data.bot_message.sientific_name} <br>
                                🐳 آبـــــیاری: ${response.data.bot_message.irrigation} <br>
                                🌞 نور مناسب گیاه: ${response.data.bot_message.light} <br>
                                💪کود تقویتی مناسب:  ${response.data.bot_message.Fertilizer} <br>
                                🦠علائم آفت شایع: ${response.data.bot_message.illness} <br>
                                🪴محل مناسب نگهداری گیاه: ${response.data.bot_message['indoor/outdoor']}<br>
                                    <br>
                                ---- <br>
                                اگه میخوای همه نیاز های گیاه رو بهت یادآوری کنم "فعــــالسازی✅" رو بزن. <br>
                                <div class="inline_keyboard_rows flex flex-col justify-start items-center absolute left-0 w-full"><div class="inline_keyboard_row flex justify-between items-center w-full"><div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="submit" data-plant-name="${response.data.bot_message.common_name}">فعــــالسازی✅</div></div></div>
                            `;
                    }
                    else {
                        bot_answer_text = response.data.bot_message;
                    }
                    saveMessageToDB(bot_answer_text, "bot", "text", null, (e) => {

                        chat_box.insertAdjacentHTML(`beforeend`, `
                                <div dir="rtl" data-message-id="${e}" class="bot-message message bg-blue-500 text-white p-2 rounded-lg mb-2 text-xs w-3/4 shadowed">
                                ${bot_answer_text}
                                </div>
                                `);
                        // console.log(chat_box.lastElementChild)
                        setInlineKeyboardsStyle(chat_box.lastElementChild)
                        scrollToBottom()
                    });

                }).catch(err => {
                    console.log(err)
                })
            });
        });


    };

    input.click();
};

const scrollToBottom = () => {
    setTimeout(() => {
        chat_box.scrollTop = chat_box.scrollHeight - chat_box.clientHeight + 80;
    }, 200);
};

const remindHours = ["09", "11", "19", "21",]
console.log(new Date().getHours().toString())
const getNewMessages = (tableName) => {
    if (tableName === "reminder") {
        if (remindHours.includes(new Date().getHours().toString())) {
            axios.get(`/remider`).then(newMessage => {
                let remindedMessages = [];
                if (JSON.parse(localStorage.getItem(`reminded`))) {
                    remindedMessages = JSON.parse(localStorage.getItem(`reminded`))
                }
                const messagesArray = newMessage.data.messagesArray
                messagesArray.forEach(message => {
                    console.log(remindedMessages)
                    if (!remindedMessages.includes(message.index)) {
                        sendMessage("bot", message.text);
                        remindedMessages.push(message.index)
                    }
                })
                localStorage.setItem(`reminded`, JSON.stringify(remindedMessages))
            })
        }

    } else if (tableName === "dr_blom") {
        axios.get(`/dr_blom`).then(newMessage => {
            const messagesArray = newMessage.data.messagesArray
            messagesArray.forEach(message => {
                sendMessage("bot", message);
            })
        })
    }
}

function updateMessageTextById(id, newText, callback) {
    const transaction = db.transaction(["messages"], "readwrite");
    const objectStore = transaction.objectStore("messages");

    // دریافت پیام با استفاده از آیدی
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = function (event) {
        const message = event.target.result;

        // چک کردن اینکه پیام موجود است
        if (message) {
            message.text = newText; // متن جدید را تنظیم کنید

            // ذخیره‌سازی پیام به‌روزرسانی‌شده
            const updateRequest = objectStore.put(message);

            updateRequest.onsuccess = function () {
                console.log("Message updated successfully");
                if (callback) callback(null); // اگر تابع callback داده شده، صدا بزنید
            };

            updateRequest.onerror = function () {
                console.error("Error updating message text in IndexedDB");
                if (callback) callback("Error updating message");
            };
        } else {
            console.error("Message not found with the given ID");
            if (callback) callback("Message not found");
        }
    };

    getRequest.onerror = function () {
        console.error("Error retrieving message from IndexedDB");
        if (callback) callback("Error retrieving message");
    };
}


const command = (event) => {
    console.log(event.target)
    sendMessage("user", event.target.getAttribute(`data-command`))
    const formData = new FormData()
    formData.append(`command`, event.target.getAttribute(`data-command`))
    axios.post(`/commandAnswer`, formData).then(answer => {
        commandBox.classList.toggle(`openCommand`)
        commandBox.classList.toggle(`closeCommand`)
        setTimeout(() => {
            sendMessage("bot", answer.data)
        }, 500)
    })
}