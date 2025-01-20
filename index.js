import { tweetsData as tweetsDataFromFile } from './data.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let tweetsData = [];
if (localStorage.getItem('tweetsData')) {
    tweetsData = JSON.parse(localStorage.getItem('tweetsData'));
} else {
    tweetsData = tweetsDataFromFile;
    saveToLocalStorage();
}

document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like);
    } else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet);
    } else if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply);
    } else if (e.target.id === 'tweet-btn') {
        handleTweetBtnClick();
    } else if (e.target.dataset.replySubmit) {
        handleReplySubmitClick(e.target.dataset.replySubmit);
    } else if (e.target.dataset.deleteTweet) {
        handleDeleteTweet(e.target.dataset.deleteTweet);
    }
});

function handleDeleteTweet(tweetId) {
    tweetsData = tweetsData.filter(tweet => tweet.uuid !== tweetId);
    saveToLocalStorage();
    render();
}



function handleLikeClick(tweetId) {
    const targetTweetObj = tweetsData.find(tweet => tweet.uuid === tweetId);

    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--;
    } else {
        targetTweetObj.likes++;
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked;
    saveToLocalStorage();
    render();
}

function handleRetweetClick(tweetId) {
    const targetTweetObj = tweetsData.find(tweet => tweet.uuid === tweetId);

    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--;
    } else {
        targetTweetObj.retweets++;
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
    saveToLocalStorage();
    render();
}

function handleReplyClick(replyId) {
    const replyContainer = document.getElementById(`replies-${replyId}`);
    replyContainer.classList.toggle('hidden');

    const existingInput = replyContainer.querySelector('.reply-input-area');
    if (!existingInput) {
        replyContainer.innerHTML += `
            <div class="reply-input-area">
                <textarea placeholder="reply here..." id="reply-input-${replyId}" class="reply-input"></textarea>
                <button data-reply-submit="${replyId}" class="reply-btn">Reply</button>
            </div>
        `;
    }
}

function handleReplySubmitClick(replyId) {
    const replyInput = document.getElementById(`reply-input-${replyId}`);
    if (!replyInput) {
        return;
    }
    const replyText = replyInput.value.trim();
    if (replyText) {
        const targetTweetObj = tweetsData.find(tweet => tweet.uuid === replyId);
        targetTweetObj.replies.push({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: replyText,
            uuid: uuidv4(), // Ensure each reply gets its own unique ID
        });
        saveToLocalStorage();
        render();
    }
}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById('tweet-input');

    if (tweetInput.value) {
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4(),
        });
        saveToLocalStorage();
        render();
        tweetInput.value = '';
    }
}

function getFeedHtml() {
    let feedHtml = ``;
    const loggedInUser = '@Scrimba';

    tweetsData.forEach(function (tweet) {
        let likeIconClass = tweet.isLiked ? 'liked' : '';
        let retweetIconClass = tweet.isRetweeted ? 'retweeted' : '';

        let repliesHtml = '';
        if (tweet.replies.length > 0) {
            tweet.replies.forEach(function (reply) {
                let deleteReplyHtml = '';
                if (reply.handle === loggedInUser) {
                    deleteReplyHtml = `
                        <i class="fa-solid fa-trash" data-delete-reply="${reply.uuid}" data-tweet-id="${tweet.uuid}" class="delete-reply-btn"></i>
                    `;
                }
                repliesHtml += `
                    <div class="tweet-reply">
                        <div class="tweet-inner">
                            <img src="${reply.profilePic}" class="profile-pic">
                            <div>
                                <p class="handle">${reply.handle}</p>
                                <p class="tweet-text">${reply.tweetText}</p>
                            </div>
                        </div>
                        ${deleteReplyHtml}
                    </div>
                `;
            });
        }

        feedHtml += `
            <div class="tweet">
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${tweet.handle}</p>
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail">
                                <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-heart ${likeIconClass}" data-like="${tweet.uuid}"></i>
                                ${tweet.likes}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-retweet ${retweetIconClass}" data-retweet="${tweet.uuid}"></i>
                                ${tweet.retweets}
                            </span>
                        </div>
                    </div>
                    ${tweet.handle === loggedInUser ? `
                        <i class="fa-solid fa-trash" data-delete-tweet="${tweet.uuid}" class="delete-btn"></i>
                    ` : ''}
                </div>
                <div class="hidden" id="replies-${tweet.uuid}">
                    ${repliesHtml}
                </div>
            </div>
        `;
    });

    return feedHtml;
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml();
}

function saveToLocalStorage() {
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
}

render();
