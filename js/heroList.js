loadHeroList();
function loadHeroList() {
    // var heroListId = document.getElementById('heroListId');
    // var abc = '<div class="hero"> <img class="heroImage" src="Images/Actors Manual Modified/Aamir Khan Modified/Aamir Khan1.jpg" ></div>';
    // abc += '<div class="hero"> <img class="heroImage" src="Images/Actors Manual Modified/Aamir Khan Modified/Aamir Khan1.jpg" ></div>';
    // abc += '<div class="hero"> <img class="heroImage" src="Images/Actors Manual Modified/Aamir Khan Modified/Aamir Khan1.jpg" ></div>';
    // heroListId.innerHTML = abc;
}

const dragArea = document.querySelector(".wrapper");
new Sortable(dragArea, {
    animation: 350
});