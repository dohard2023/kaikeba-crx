const query = <T>(url: string, method: string = "GET") => {
  return new Promise<T>((resolve, reject) => {
    const config = {
      method: method, // *GET, POST, PUT, DELETE, etc.
    };
    fetch(url, config)
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getCookies") {
    try {
      chrome.cookies.getAll(
        {
          url: "http://multilingual-translation-system-dev.songmao.tech",
        },
        (cookies) => {
          sendResponse(cookies);
        }
      );
    } catch (error) {
      sendResponse({
        error,
      });
    }
  } else if (request.type === "getFile") {
    try {
      query(request.url)
        .then((res) => {
          sendResponse(res);
        })
        .catch(() => {
          sendResponse(null);
        });
    } catch (error) {
      sendResponse(null);
    }
  }

  return true;
});
