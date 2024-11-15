const inline_keyboard_buttons = document.querySelectorAll(`.inline_keyboard_button`);
inline_keyboard_buttons.forEach(inline_keyboard_button => {
    inline_keyboard_button.addEventListener(`click`, (e) => {
        inline_keyboard_buttons.forEach(i => {
            i.style.backgroundColor = `#000000a6`
        })
        inline_keyboard_button.style.backgroundColor = `#00000055`
        localStorage.setItem(`answerTo`, e.target.getAttribute(`data-image`));
    });
})

const sendInlineKeyboardData = (e) => {
    const callbackText = e.target.getAttribute('data-callback');
    const image = e.target.getAttribute('data-image');

    if (image) {

        const formData = new FormData();
        formData.append('callbackText', callbackText);
        formData.append('image', image);

        axios.post('http://localhost:3000/admin/answer', formData).then(answer => {
            console.log(answer.data.arguments);

        }).catch(error => {
            console.error('Error sending inline keyboard data:', error);
        });
    } else {
        console.error('messageId is missing!');
    }
};


const chat_box = document.querySelector(`.messages`);
const text_inp = document.querySelector(`#textInput`);

const sendMessage = (text) => {
    if (text.length > 0 && text.trim() !== "") {
        if (localStorage.getItem(`answerTo`)) {

            const formData = new FormData()
            formData.append(`image`, localStorage.getItem(`answerTo`))
            formData.append(`text`, text)
            axios.post(`/admin/answer`, formData).then(answer => {
                localStorage.removeItem(`answerTo`)
            })

            const messageHTML = `
                    <div dir="rtl" class="user-message message bg-blue-500 text-white p-2 rounded-lg mb-2 text-xs w-2/3 shadowed">
                        <p>${text}</p>
                    </div>
                `;

            chat_box.insertAdjacentHTML('beforeend', messageHTML);

            text_inp.value = '';

            scrollToBottom();
        }

    }
};

sendButton.addEventListener(`click`, () => sendMessage(text_inp.value));
document.body.addEventListener(`keydown`, (e) => {
    if (e.keyCode === 13) {
        sendMessage(text_inp.value);
    }
});


const scrollToBottom = () => {
    setTimeout(() => {
        chat_box.scrollTop = chat_box.scrollHeight - chat_box.clientHeight + 80;
    }, 200);
};
