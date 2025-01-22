//v33333333333333333
document.getElementById("gear-icon").addEventListener("click", function () {
  const gearIcon = document.getElementById("gear-icon");
  gearIcon.style.display = "none";
  const offcanvas = new bootstrap.Offcanvas(document.getElementById("quickLinks"));
  offcanvas.show();
  document.getElementById("quickLinks").addEventListener("hidden.bs.offcanvas", function () {
      gearIcon.style.display = "block";
  });
});
 // Select all cards with the class "clickable-card"
    const cards = document.querySelectorAll(".clickable-card");

    // Loop through each card and add a click event listener
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const url = card.getAttribute("data-url"); // Get the URL from the data-url attribute
           if (url) {
                zc_OpenWindow(url); // Zoho Creator's built-in popup method
            }
        });

        // Add hover effect for better UX
        card.style.cursor = "pointer";
        card.addEventListener("mouseover", () => {
            card.classList.add("shadow-lg");
        });
        card.addEventListener("mouseout", () => {
            card.classList.remove("shadow-lg");
        });
    });
// Initialize zoho js API
// function deviceType() {
//   const ua = navigator.userAgent;
//   if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
//     return "tablet";
//   }
//   else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
//     return "mobile";
//   }
//   return "desktop";
// };
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
// console.log(deviceType());
ZOHO.CREATOR.init()
  .then(function (data) {
    // Get Records from ZOho Creator
    const getRecords = async () => {
      const searchModels = ["Backend_Work_Orders", "All_Job_Cards", "Item_DC1", "Backend_Search_Results"];
      var initparams = ZOHO.CREATOR.UTIL.getInitParams();
      // Fetch all records from Form 1

      var sourceRecords = await ZOHO.CREATOR.API.getAllRecords({
        appName: "zubconj25",
        reportName: "All_Users",
        criteria: '(Email = "' + initparams.loginUser + '" && User_Status = "Active" && Log_in_out = "Logged In")'
      });

      console.log(sourceRecords);
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        const promises = searchModels.map(async (model) => {
          try {
            const config = {
              appName: "zubconj25",
              reportName: model,
            };

            const records = (model !== "Backend_Search_Results")
              ? await ZOHO.CREATOR.API.getAllRecords({
                appName: "zubconj25",
                reportName: model,
                criteria: '(Organization_id=' + sourceRecords.data[0].Organization_ID.ID + ')'
              })
              : await ZOHO.CREATOR.API.getAllRecords(config);
              if (isIOS()) {
                await delay(300);
              }
            return { [model]: records.data };
          } catch (error) {
            return { [model]: [{ "error": JSON.parse(error.responseText).message, "Name": model }] };
          }
        });

        const results = await Promise.all(promises);

        // Merge all results into a single object
        const res = Object.assign({}, ...results);
        return res;
      } catch (error) {
        console.error('Critical Error:', error);
      }
    }


    const myFunction = async (url, event) => {
      event.preventDefault();
      config = {
        action: "open",
        url: "https://zubconj25.zohocreatorportal.in/#Form:" + url + "?zc_LoadIn=dialog",
        window: "same"
      }

      await ZOHO.CREATOR.UTIL.navigateParentURL(config);
    }

    const parama = async (url, event) => {
      event.preventDefault();
      config = {
        action: "open",
        url: "https://zubconj25.zohocreatorportal.in/#Report:" + url + "?zc_LoadIn=dialog",
        window: "same"
      }

      await ZOHO.CREATOR.UTIL.navigateParentURL(config);
    }

    const documentParam = async (url, event) => {
      event.preventDefault();
      config = {
        action: "open",
        url: "https://zubconj25.zohocreatorportal.in/#Report:" + url + "&zc_LoadIn=dialog",
        window: "same"
      }

      await ZOHO.CREATOR.UTIL.navigateParentURL(config);
    }
    // Append Item list in the UI
    const appendItems = (all_items, event) => {

      const replaceModel = {"All_Job_Cards":"Job Cards",
        "Item_DC1": "DC",
       "Backend_Work_Orders": "work order" }
      const list = document.querySelector(".list");
      list.innerHTML = ""; // Clear existing items

      // Create separate containers for each category
      const createNewContainer = document.createElement('div');
      const viewUpdateContainer = document.createElement('div');
      const idsContainer = document.createElement('div')
      if (all_items.length == 0) {
        idsContainer.innerHTML = "No Result Found 😑";
        list.appendChild(idsContainer);
        return
      }
      
      for (let i = 0; i < all_items.length; i++) {
        const divWrapper = document.createElement('div'); // Create a div wrapper for each button or error message
        divWrapper.classList.add('button-wrapper'); // Add a class to the wrapper

        if (all_items[i].error) {
          // Create and display an error message
          const errorMessage = document.createElement('p');
          errorMessage.textContent = all_items[i].Name + " - " + all_items[i].error;
          errorMessage.classList.add('error-message'); // Add a class for styling
          divWrapper.appendChild(errorMessage);
          idsContainer.appendChild(divWrapper); // Append the error message to the "Documents" section
        } else {
          // Create and display a button
          const button = document.createElement('button');
          button.textContent = all_items[i].Name + "↖";
          button.classList.add('custom-button'); // Add a custom button class for styling

          // Add event listeners based on Type_field
          if (all_items[i].Type_field === "Create New") {
            createNewContainer.innerHTML = "<h6>Create New</h6>";
            createNewContainer.appendChild(divWrapper);
            button.addEventListener('click', () => myFunction(all_items[i].Link_Name, event));
          } else if (all_items[i].Type_field === "View | Update") {
            viewUpdateContainer.innerHTML = "<h6>View | Update</h6>";
            viewUpdateContainer.appendChild(divWrapper);
            button.addEventListener('click', () => parama(all_items[i].Link_Name, event));
          } else {
            idsContainer.innerHTML = "<h6> Documents </h6>";
            button.textContent = replaceModel[all_items[i].modelName] + " - " + all_items[i].Name;
            idsContainer.appendChild(divWrapper);
            button.addEventListener('click', () => documentParam(all_items[i].Link_Name, event));
          }

          divWrapper.appendChild(button); // Append the button to the wrapper
        }
      }

      // Append both containers to the main list
      list.appendChild(createNewContainer);
      list.appendChild(viewUpdateContainer);
      list.appendChild(idsContainer);
    }

    document.addEventListener("DOMContentLoaded", async (event) => {
      const nameArr = await getRecords();
      const resultArray = []
      Object.keys(nameArr).forEach(key => {
        nameArr[key].forEach(arr => {
          if (arr.fl_dc_no_ref?.toLowerCase().includes(val.toLowerCase()) || false) {
            arr["modelName"] = key;
            arr["Name"] = arr?.fl_dc_no_ref || arr.error;
            arr["Link_Name"] = "Back_End_Part_DC?fl_dc_no_ref=" + arr.fl_dc_no_ref;
            resultArray.push(arr);
          } else if (arr.fl_job_card_no?.toLowerCase().includes(val.toLowerCase()) || false) {
            arr["modelName"] = key;
            arr["Name"] = arr.fl_job_card_no || arr.error;
            arr["Link_Name"] = "All_Job_Cards?fl_job_card_no=" + arr.fl_job_card_no;
            resultArray.push(arr);
          } else if (arr.fl_work_order_no?.toLowerCase().includes(val.toLowerCase()) || false) {
            arr["modelName"] = key;
            arr["Name"] = arr.fl_work_order_no || arr.error;
            arr["Link_Name"] = "Backend_Work_Orders?fl_work_order_no=" + arr.fl_work_order_no;
            resultArray.push(arr);
          } else if (arr.Name?.toLowerCase().includes(val.toLowerCase()) || false) {
            resultArray.push(arr);
          } else if (arr.error || false) {
            resultArray.push(arr);
          }
        });
      });
      appendItems(resultArray, event);
    });



    // Input Actions
    const initializeSearch = () => {
      const searchInput = document.querySelector("#search");
      const list = document.querySelector(".list");
      console.log(isIOS());
      if (isIOS()) {
        const lists = document.querySelector(".list");
        lists.innerHTML = "";
        const createNewContainer = document.createElement('div');
        createNewContainer.innerHTML = "is not support ios";
        lists.append(createNewContainer);
      }
      const handleSearch = async (event) => {
        const val = event.target.value || "";
        if (val) {
          list.classList.remove("d-none");
        }
        else {
          list.classList.add("d-none");
        }

        try {
          const nameArr = await getRecords();
          const resultArray = [];
          Object.keys(nameArr).forEach((key) => {
            nameArr[key].forEach((arr) => {
              if (arr.fl_dc_no_ref?.toLowerCase().includes(val.toLowerCase())) {
                arr["modelName"] = key;
                arr["Name"] = arr.fl_dc_no_ref || arr.error;
                arr["Link_Name"] = "Back_End_Part_DC?fl_dc_no_ref=" + arr.fl_dc_no_ref;
                resultArray.push(arr);
              } else if (arr.fl_job_card_no?.toLowerCase().includes(val.toLowerCase())) {
                arr["modelName"] = key;
                arr["Name"] = arr.fl_job_card_no || arr.error;
                arr["Link_Name"] = "All_Job_Cards?fl_job_card_no=" + arr.fl_job_card_no;
                resultArray.push(arr);
              } else if (arr.fl_work_order_no?.toLowerCase().includes(val.toLowerCase())) {
                arr["modelName"] = key;
                arr["Name"] = arr.fl_work_order_no || arr.error;
                arr["Link_Name"] = "Backend_Work_Orders?fl_work_order_no=" + arr.fl_work_order_no;
                resultArray.push(arr);
              } else if (arr.Name?.toLowerCase().includes(val.toLowerCase())) {
                resultArray.push(arr);
              } else if (arr.error) {
                resultArray.push(arr);
              }
            });
          });
          appendItems(resultArray, event);
        } catch (error) {
          console.error("Error fetching records:", error);
        }
      };

      searchInput.addEventListener("input", handleSearch);
      searchInput.addEventListener("keyup", handleSearch);
      searchInput.addEventListener("change", handleSearch);
    };

    initializeSearch();


    // Function to reinitialize search
    // const reinitializeSearch = () => {
    //   // Remove the old event listener if necessary
    //   const searchInput = document.querySelector("#search");
    //   const newSearchInput = searchInput.cloneNode(true);
    //   searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    //   // Add the event listener again
    //   initializeSearch();
    // };
  });
