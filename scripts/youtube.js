window.addEventListener("load", () => {
   const commentsBlockInterval = setInterval(async () => {
      const comments = document.querySelectorAll("#contents ytd-comment-thread-renderer");

      if (comments && comments.length > 0) {
         comments.forEach(async (node) => {
            await hideComment(node);
         })
         await observeYoutubeComments();

         clearInterval(commentsBlockInterval);
      }
   }, 1000);
});

const observeYoutubeComments = async () => {
   // Create an observer to check for new comments
   const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
         // Check if the childList has changed
         if (mutation.type === "childList") {
            mutation.addedNodes.forEach(async node => {
               await hideComment(node);
            });
         }
      });
   });

   observer.observe(document.querySelector("#contents"), {
      childList: true
   });
};



const hideComment = async (node) => {
   const commentText = getCommentText(node);
   const isCommentBlockDisplayed = !node?.querySelector('.show-ytb-comment-btn');

   if (commentText && commentText.length > 1 && isCommentBlockDisplayed) {
      if (await isCommentNegative(commentText)) {
         node.querySelector("#content-text").style.display = "none";
         await createActionButton("Display Sensitive Comment", node.querySelector("ytd-comment-action-buttons-renderer #toolbar"));
      }
   }
}

const getCommentText = (node) => node?.querySelector("yt-formatted-string#content-text")?.innerText?.trim();


const isCommentNegative = async (commentText) =>
   await fetch('http://localhost:8082/api/users/1/comment/check', {
      method: 'POST',
      mode: 'cors',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': 'Basic dXNlcjp1c2VyUGFzcw==',
      },
      body: JSON.stringify({
         text: commentText
      }),
   }).then(response => response.json());



const createActionButton = async (btnText, node) => {
   const originalYtbBtnCss = document.querySelector("yt-button-shape button").classList;
   const newButton = document.createElement('button');
   newButton.style.maxWidth = '22rem';
   newButton.innerHTML = btnText;
   newButton.classList = 'show-ytb-comment-btn ' + originalYtbBtnCss;
   await node.appendChild(newButton);

   newButton.addEventListener('click', (event) => {
      event.target.closest('#main').querySelector("#content-text").style.display = "block";
   });
}