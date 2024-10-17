
// Initialize zoho js API
ZOHO.CREATOR.init()
  .then(function (data) {

    // Get Records from ZOho Creator
    const getRecords = async () => {
      const config = {
        appName: "zubcon-backup-j25",
        reportName: "Backend_Search_Results"
      }
      try {
        const response = await ZOHO.CREATOR.API.getAllRecords(config);
        return response.data;
      } catch (error) {
        console.log(error);
      }

      
    }

    const myFunction = async (url) => {
      config = {
        action: "open",
        url: "https://creatorapp.zoho.in/app_zubcon/zubcon-backup-j25/#Form:" + url,
        window: "same"
      }

      await ZOHO.CREATOR.UTIL.navigateParentURL(config);


// Append Item list in the UI
const appendItems = (all_items) => {
  const list = document.querySelector(".list");
  list.innerHTML = ""; // Clear existing items

  // Create separate containers for each category
  const createNewContainer = document.createElement('div');
  const viewUpdateContainer = document.createElement('div');

  // Add headers for each section
  createNewContainer.innerHTML = "<h6>Create New</h6>";
  viewUpdateContainer.innerHTML = "<h6>View | Update</h6>";

  // Iterate over all items
  for (let i = 0; i < all_items.length; i++) {
    const divWrapper = document.createElement('div'); // Create a div wrapper for each button
    divWrapper.classList.add('button-wrapper'); // Add a class to the wrapper

    const button = document.createElement('button');
    button.textContent = all_items[i].Name;
    button.addEventListener('click', () => myFunction(all_items[i].Link_Name));
    button.classList.add('custom-button'); // Add a custom button class for styling

    divWrapper.appendChild(button); // Append button to div wrapper

    // Append buttons to the appropriate section based on Type_field
    if (all_items[i].Type_field === "Create New") {
      createNewContainer.appendChild(divWrapper);
    } else if (all_items[i].Type_field === "View | Update") {
      viewUpdateContainer.appendChild(divWrapper);
    }
  }



    // Input Actions
    document.querySelector("#search").addEventListener("input", async (event) => {
      const val = event.target.value;
      const list = document.querySelector(".list");
      if (val) {
        list.classList.remove("d-none");
      }
      else {
        list.classList.add("d-none");
      }
      const nameArr = await getRecords();
      const new_arr = nameArr.filter(item => item.Name.toLowerCase().includes(val.toLowerCase()));
      appendItems(new_arr);
    })



  });
