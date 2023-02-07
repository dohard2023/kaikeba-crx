const request = <T>(
  url: string,
  body: object,
  method: string = "GET",
  cookie: string = ""
) => {
  return new Promise<T>((resolve, reject) => {
    const config = {
      method: method, // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
    } as any;
    if (method === "POST") {
      config.body = JSON.stringify(body);
    }
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

const SAVE_BUTTON = ".ant-btn.ant-btn-success"; // 保存按钮
const BUTTON_GROUP = ".text-right.ant-col.ant-col-16"; // 保存按钮

const TBODY = ".ant-table-tbody"; // 表格body

/**
 * DOM 节点
 */
let saveButton = null as HTMLButtonElement; // 保存按钮
let tbody = null as HTMLTableElement; // 表格body
let buttonGroup = null as HTMLDivElement; // 表格body

/**
 * 获取主要的两个节点
 */
const await_elements = <
  T1,
  T2 = HTMLDivElement,
  T3 = HTMLDivElement,
  T4 = HTMLDivElement,
  T5 = HTMLDivElement
>(
  ...selector: string[]
) => {
  return new Promise<[T1, T2, T3, T4, T5]>((resolve) => {
    const ret = selector
      .filter((i) => {
        return document.querySelector(i);
      })
      .map((j) => {
        return document.querySelector(j);
      }) as unknown as [T1, T2, T3, T4, T5];
    if (ret.length === selector.length) {
      resolve(ret);
    } else {
      setTimeout(async () => {
        resolve(await await_elements(...selector));
      }, 300);
    }
  });
};

let cookie = "";
const initCookie = () => {
  return new Promise<void>((resolve) => {
    chrome.runtime.sendMessage(
      { type: "getCookies" },
      (
        cookies: {
          name: string;
          value: string;
        }[]
      ) => {
        cookie = cookies
          .map((i) => {
            return `${i.name}=${i.value}`;
          })
          .join(";");

        resolve();
      }
    );
  });
};

const langTypes = [
  "id",
  "ja",
  "ko",
  "than",
  "vi",
  "ar",
  "es",
  "pt",
  "zh-CN",
  "zh-TW",
];
const translateStr = (str: string, to_lang: string) => {
  return new Promise<string>((resolve, reject) => {
    try {
      request<{
        data: {
          translations: {
            translatedText: string;
          }[];
        };
      }>(
        "http://multilingual-translation-system-dev.songmao.tech/google_trans/",
        { query: str, to_lang },
        "POST",
        cookie
      ).then((res) => {
        resolve(res.data.translations[0].translatedText);
      });
    } catch (e) {
      reject("");
    }
  });
};

const mapJson = async (
  data: object | string,
  to_lang: string
): Promise<any> => {
  let promises = [];
  if (Array.isArray(data)) {
    promises = data.map(async (i) => {
      return await mapJson(i, to_lang);
    });

    return await Promise.all(promises);
  } else if (typeof data === "object") {
    const obj = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "content") {
        const ps = mapJson(value, to_lang);
        promises.push(ps);
        obj[key] = await ps;
      } else {
        obj[key] = value;
      }
    }
    await Promise.all(promises);
    return obj;
  } else if (typeof data === "string") {
    const res = await translateStr(data, to_lang);
    return res;
  } else {
    return data;
  }
};

const translateObject = async (
  key: string,
  data: string,
  to_lang: string
): Promise<string> => {
  return new Promise(async (resolve) => {
    try {
      chrome.runtime.sendMessage(
        { type: "getFile", url: `http://localhost:3000/${to_lang}.json` },
        async (res) => {
          if (res && res[key]) {
            // resolve(res[key]);
            resolve(JSON.stringify(JSON.parse(res[key])));
          } else {
            console.log("------", to_lang, res);
            const obj = JSON.parse(data);
            const ret = await mapJson(obj, to_lang);
            console.log("====", to_lang, ret);

            resolve(JSON.stringify(ret));
          }
        }
      );
    } catch (error) {
      console.log(`http://localhost:3000/${to_lang}.json`, error);
      resolve(to_lang);
    }
  });
};

const insert_add_btn = () => {
  const node = saveButton.cloneNode(true) as HTMLButtonElement;
  node.querySelector("span").innerText = "翻译";
  console.log(node);

  node.addEventListener("click", async () => {
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const key = tbody.querySelector("tr").querySelector("input").value;
    const value = tbody.querySelector("tr").querySelectorAll("input")[1].value;
    try {
      const json = JSON.parse(value);
      tbody.querySelectorAll("tr")[9].querySelectorAll("input");
      if (typeof json === "object") {
        langTypes.forEach(async (lang, index) => {
          const res = await translateObject(key, value, lang);
          const input = rows[index + 1].querySelectorAll("input")[0];

          const evt = new InputEvent("input", {
            inputType: "insertText",
            data: res || "",
            dataTransfer: null,
            isComposing: false,
          });
          input.value = res || "";
          input.dispatchEvent(evt);

          // rows[index + 1].querySelectorAll("input")[0].value = res || "";
        });
      } else {
        alert("不是JSON字符串");
      }
    } catch (error) {
      alert("不是JSON字符串");
    }
  });

  buttonGroup.appendChild(node);
};
window.onload = async () => {
  // 等待节点加载就绪
  [saveButton, tbody, buttonGroup] = await await_elements<
    HTMLButtonElement,
    HTMLTableElement,
    HTMLDivElement
  >(SAVE_BUTTON, TBODY, BUTTON_GROUP);

  await initCookie();

  // 增加操作按钮
  insert_add_btn();
};
