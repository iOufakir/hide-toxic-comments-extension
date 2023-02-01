window.addEventListener('popstate', () => {
   init();
});

window.addEventListener("load", () => {
   init();
});

const init = () => {
   const commentsBlockInterval = setInterval(async () => {
      const commentSection = getElementByXpath("//div[2]/main/div/div/div/div[1]/div/section/div/div");

      if (commentSection) {
         const comments = commentSection.querySelectorAll("div[data-testid='tweetText']");

         // Starting from index 1, bcs the post also use article with the same data test id.
         if (comments && comments.length > 1) {
            for (let i = 1; i < comments.length; i++) {
               const comment = comments[i];
               await hideComment(comment);
            }

            await observeComments(commentSection);

            clearInterval(commentsBlockInterval);
         }
      }
   }, 1000);
}

const observeComments = async () => {
   // Create an observer to check for new comments
   const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
         // Check if the childList has changed
         if (mutation.type === "childList") {
            mutation.addedNodes.forEach(async node => {
               const comment = node.querySelector("div[data-testid='tweetText']");
               await hideComment(comment);
            });

         }
      });
   });

   observer.observe(getElementByXpath("//div[2]/main/div/div/div/div[1]/div/section/div/div"), { childList: true });
};

getElementByXpath = (path) =>
   document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;


const hideComment = async (node) => {
   const commentText = await getCommentText(node);

   if (commentText && node?.style.display !== 'none') {
      if (await isCommentNegative(commentText)) {
         node.style.display = "none";
         createActionButton("Display Sensitive Comment", node);
      }
   }
}

const getCommentText = async (node) => await node?.querySelector("div[data-testid='tweetText'] > span")?.textContent?.trim();


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



const createActionButton = (btnText, node) => {
   const originalTwitterBtn = document.querySelector("div[data-testid='tweetButtonInline']");
   const newButton = document.createElement('button');
   newButton.style.maxWidth = '18rem';
   newButton.style.opacity = 1;
   newButton.style.cursor = 'pointer';
   newButton.style.marginTop = '1rem';
   newButton.style.marginBottom = '1rem';
   newButton.innerHTML = btnText;
   newButton.classList = originalTwitterBtn.classList + originalTwitterBtn.querySelector(':first-child').classList;
   node.parentNode.appendChild(newButton);

   newButton.addEventListener('click', (event) => {
      node.style.display = "block";
   });
}