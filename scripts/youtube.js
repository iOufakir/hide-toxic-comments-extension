window.addEventListener("load", () => {
   const commentsBlockInterval = setInterval(async () => {
      const comments = document.querySelectorAll("#contents ytd-comment-thread-renderer");

      console.log(comments);

      if (comments && comments.length > 0) {
         comments.forEach(async comment => {
            //await hideComment(comment);
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
               //await hideComment(node.querySelector("#content-text").innerText);
            });
         }
      });
   });

   observer.observe(document.querySelector("#contents"), {
      childList: true
   });
};


const hideComment = async (node) => {
   const commentElement = await node.querySelector("yt-formatted-string#content-text");
   if (commentElement) {
      const commentText = await commentElement.innerText;
      const response = await isCommentNegative(commentText);

      if (response) {
         node.style.display = "none";
      }
   }
}

const isCommentNegative = async (commentText) =>
   await fetch('https://ujaq1oc2t9.execute-api.us-east-1.amazonaws.com/dev/users/1/comment/check', {
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


