const User = require('../models/User');
const Chat = require('../models/Chat');
const { idFromCookie } = require('../middleware/components');


const casual_message = async (req, res) => {
    // idFromCookie();
    // const userID = '60fe7b0155e92148caa3d06c';
    // const userID = '60d4716dfb64a6482c128537';
    const userID = '613b0cbb08096626905def43'; // user1
    // user2 613b0cd008096626905def45
    const { friendID, message } = req.body;
    const sentDate = new Date().toUTCString();

    const chatObj = {
        authorID: userID,
        message: message,
        readStatus: false,
        sentDate: sentDate,
        readDate: ''
    };

    try {
        const chat = await Chat.findOneAndUpdate({ members: userID && friendID }, { $addToSet: { room: chatObj }}, { useFindAndModify: false }, function(err, result) {
            if (err) {
                // console.log(chatID);
                console.log('Failed insertion to room section');
                console.log(err);
            } else {
                // console.log(chat._id);
                console.log('Completed insertion to room section');
            }
        });
        // console.log(chat.room[chat.room.length - 1]._id);

        const messageID = chat.room[chat.room.length - 1]._id;

        const unreadMess = await Chat.findOneAndUpdate({ members: userID && friendID }, { $pull: { unreadMessages: { receiver: friendID}}}, { useFindAndModify: false }, function (err, result) {
            if (err) {
                console.log('Failed pull from unreadMessages section');
                console.log(err);
            } else {
                console.log('Completed pull from unreadMessages section');
            }
        });

        // const unreadMessSection = await Chat.findOne({ members: userID && friendID }).select('unreadMessages').lean();
        // console.log(unreadMessSection);
        // console.log(unreadMessSection.unreadMessages)

        console.log("UNREAD MESS" + unreadMess);
        const unreadMessArr = [];
        const unread_mess_object = unreadMess.unreadMessages;
        console.log('SEC UNR MESS' + unread_mess_object);

        function rebaseMessages(arrayOfMessages, destinationArray) {
            for (let i = 0; i < arrayOfMessages.length; i++) {
                destinationArray.push(arrayOfMessages[i]);
            }
            destinationArray.push(messageID);
            return destinationArray;
        };

        const toSendArray = rebaseMessages(unread_mess_object, unreadMessArr);

        console.log(toSendArray);


        // unreadMessArr.push(unread_mess_object.messages);
        // console.log(unreadMessArr);
        // unreadMessArr.push(messageID);
        // console.log(unreadMessArr);

        const unreadMessReturn = await Chat.findOneAndUpdate({ members: userID && friendID }, { $addToSet: { unreadMessages: { receiver: friendID, messages: toSendArray }}}, { useFindAndModify: false }, function (err, result) {
            if (err) {
                console.log('Failed isertion to unreadMessages section');
                console.log(err);
            } else {
                console.log('Completed insertion to unreadMessages section');
            }
        })

        res.status(200).json(chat);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: 'Something goes wrong, please try again!'});
    }
};
