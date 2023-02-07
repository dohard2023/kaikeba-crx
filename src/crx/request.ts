/**
 * 用于请求片段数据
 */
const request = (url: string, body: object, cookie: string) => {
  return new Promise<string>((resolve, reject) => {
    fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.text())
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default request;
