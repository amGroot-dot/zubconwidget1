//v33333333333333333
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
const collectSourceData = {}

ZOHO.CREATOR.init().then(async function (data) {
  var initparams = ZOHO.CREATOR.UTIL.getInitParams();
  // Fetch all records from Form 1

  var sourceRecords = await ZOHO.CREATOR.API.getAllRecords({
    appName: "zubconj25",
    reportName: "All_Users",
    criteria: '(Email = "' + initparams.loginUser + '" && User_Status = "Active" && Log_in_out = "Logged In")'
  });
  collectSourceData.name = sourceRecords.data[0].Name;
  collectSourceData.orgDisval = sourceRecords.data[0].Organization_ID.display_value.split("-")[1];
  collectSourceData.orgId = sourceRecords.data[0].Organization_ID.ID;

  document.getElementById("userAndOrgId").innerText = collectSourceData.name + " || " + collectSourceData.orgDisval;
  closingStock();
});

ZOHO.CREATOR.init()
  .then(function (data) {
    // Get Records from ZOho Creator
    const getRecords = async () => {
      const searchModels = ["Backend_Work_Orders", "All_Job_Cards", "Item_DC1", "Backend_Search_Results"];
      var iosSearchRes = "";
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
                criteria: '(Organization_id=' + collectSourceData.orgId + ')'
              })
              : await ZOHO.CREATOR.API.getAllRecords(config);
            return { [model]: records.data };
          } catch (error) {
            return { [model]: [{ "error": JSON.parse(error.responseText).message, "Name": model }] };
          }
        });

        if (isIOS()) {
          const records = await ZOHO.CREATOR.API.getAllRecords({
            appName: "zubconj25",
            reportName: "Backend_Search_Results",
          });
          iosSearchRes = [{ "Backend_Search_Results": records.data }]
        }
        const results = (isIOS()) ? iosSearchRes : await Promise.all(promises);

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

      const replaceModel = {
        "All_Job_Cards": "Job Cards",
        "Item_DC1": "DC",
        "Backend_Work_Orders": "work order"
      }
      const list = document.querySelector(".list");
      list.innerHTML = ""; // Clear existing items

      // Create separate containers for each category
      const createNewContainer = document.createElement('div');
      const viewUpdateContainer = document.createElement('div');
      const idsContainer = document.createElement('div');
      const isCheckContainer = {}
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
            if (!isCheckContainer.create) {
              createNewContainer.innerHTML = "<h6>CREATE NEW</h6>";
              isCheckContainer.create = true;
            };
            createNewContainer.appendChild(divWrapper);
            button.addEventListener('click', () => myFunction(all_items[i].Link_Name, event));
          } else if (all_items[i].Type_field === "View | Update") {
            if (!isCheckContainer.view) {
              isCheckContainer.view = true;
              viewUpdateContainer.innerHTML = "<h6>VIEW | UPDATE</h6>";
            };
            viewUpdateContainer.appendChild(divWrapper);
            button.addEventListener('click', () => parama(all_items[i].Link_Name, event));
          } else {
            if (!isCheckContainer.id) {
              isCheckContainer.id = true;
              idsContainer.innerHTML = "<h6> DOCUMENTS </h6>";
            };
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
      // document.getElementById()
      // if (isIOS()) {
      //  document.getElementById("div-search-bar").style.display = "none"
      // }
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
    // const closingStocks = async(orgId) => {
    // var fgClosingStock = await ZOHO.CREATOR.API.getAllRecords({
    //     appName: "zubconj25",
    //     reportName: "All_Inventory_Transactions",
    //     criteria: '(Organization_id=' + orgId + ')'
    //   })
    //   document.getElementById("FGClosingStockH5").innerText = Math.round(fgClosingStock.data.reduce((sum,cur) => sum + Number(cur.fl_closing_stock), 0))

    //    var rawMaterialClosingStockValue = await ZOHO.CREATOR.API.getAllRecords({
    //     appName: "zubconj25",
    //     reportName: "Raw_Material_Inventory_Summary",
    //     criteria: '(Organization_id=' + orgId + ')'
    //   })
    //   document.getElementById("Raw Material Closing Stock Value").innerText = Math.round(rawMaterialClosingStockValue.data.reduce((sum,cur) => sum + Number(cur.Inventory_Value), 0))
    // }


  });

// const closingStock = async () => {

//   try {
//     const reportNames = [
//       "Raw_Material_Inventory_Summary",
//       "Item_Inventory_Summary",
//       "All_Inventory_Transactions"
//     ];
//     const tagIds = [
//       ["RawMaterialClosingStockH5", "RawMaterialClosingStockValueH5"],
//       ["PartClosingStockH5", "PartClosingStockH5Value"],
//       ["FGClosingStockH5", "FGClosingStockValueH5"]
//     ];

//     const reports = await Promise.all(
//       reportNames.map(async (repName) => {
//         return await ZOHO.CREATOR.API.getAllRecords({
//           appName: "zubconj25",
//           reportName: repName,
//           criteria: '(Organization_id=' + collectSourceData.orgId + ')',
//         });
//       })
//     );

//     reports.map((report, index) => {
//       document.getElementById(tagIds[index][0]).innerText = numIntoRupFormat(
//         Math.round(
//           report.data.reduce(
//             (sum, cur) => sum + Number((cur.fl_process !== "Finished Goods" && cur.fl_process) ? 0 : cur.fl_closing_stock),
//             0
//           )
//         ).toString(), true
//       );

//       document.getElementById(tagIds[index][1]).innerText = "₹ " + numIntoRupFormat(
//         report.data.reduce(
//           (sum, cur) => sum + Number((cur.fl_process !== "Finished Goods" && cur.fl_process) ? 0 : cur.Inventory_Value),
//           0
//         ).toFixed(2).toString(), false
//       );
//     });
//   } catch (error) {
//     console.error("Error fetching reports:", error)
//   }
// }

// const numIntoRupFormat = (curr, flag) => {
//   var first_curr = curr.split(".")[0];
//   if (curr.includes(".") && first_curr.length > 3) {
//     var last_three_digits = "," + first_curr.substring(first_curr.length - 3, first_curr.length);
//     var rem_len = first_curr.length - 3;
//     var otherDigits = first_curr.substring(0, rem_len);
//     otherDigits = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
//     return otherDigits + last_three_digits + "." + curr.split(".")[1];
//   }
//   else if (curr.length > 3 && flag) {
//     var last_three_digits = "," + curr.substring(curr.length - 3, curr.length);
//     var rem_len = curr.length - 3;
//     var otherDigits = curr.substring(0, rem_len);
//     otherDigits = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
//     return  otherDigits + last_three_digits;
//   }
//   else {
//     return curr
//   }


// } 
