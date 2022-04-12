var searchBox = $(".search-box")
var inputSearchEl = $("#inputSearch")
var searchBtnEl = $("#search-button")
const apiKey = '1d875e894093bebe3c4513a318409f43'
var imgIconCurrenDay = $("#icon-current-day")
var srchHisContEl = $("#search-history")
var citiesUlEl = $("#cities")
var startdate = moment().format('MM-DD-YYYY')
var searchHist = $("#search-history")

var frctext = ""


if (!localStorage.getItem("cities")) {
    var cities = [];
} else var cities = JSON.parse(localStorage.getItem("cities"))


var getWeatherConditions = function(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+apiKey+"&units=imperial"
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {    
                //store city name in local storage\
                let currentCity = data.name
                localStorage.setItem(""+data.name,data.name)
                if (!cities.includes(currentCity)) {
                    cities.push(currentCity)    
                }
                localStorage.setItem("cities",JSON.stringify(cities))
                displayDailyForecast(currentCity)
                displayCurrentDay(data,currentCity)
                getUVIndex(data.coord.lat,data.coord.lon)
            })
        } else {
            alert("City name not found")
            return false
        }
    })
}

function getUVIndex(lat,lng) {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      beforeSend: function(request) {
        request.setRequestHeader('x-access-token', '65113a2397cbf76a91327f31e2bcf2db');
      },
      url: 'https://api.openuv.io/api/v1/uv?lat=' + lat + '&lng=' + lng,
      success: function(response) {
        var uv = response.result.uv
        var frcUV = $("<p>")
        frcUV.text("UV INNDEX: "+uv)
        $("#currentDay").append(frcUV).addClass("h4")
        if (uv < 3) {
            frcUV.attr("class","lowUV")
        } else if (3<uv && uv<6) {
            frcUV.attr("class","modUV")
        } else if (6<uv&&uv<8) {
            frcUV.attr("class","highUV")
        } else if (8<uv&&uv<11){
            frcUV.attr("class","vhighUV")
        } else {
            frcUV.attr("class","extrUV")
        }
      },
      error: function(response) {
        alert("UV API ERROR")
      }
    });
   }




var renderSearchHist = function(currentCity){
    if (cities.includes(currentCity) || currentCity === "") {
        console.log("already in cities[]");
        return
    }
    if (!currentCity) {
        cities.forEach(element => {
            var divCity = $("<div>")
            divCity.text(element).addClass("btn").addClass("btn-secondary")
            searchHist.append(divCity)
        });
        
    }  
    else if(currentCity) {
        var divCity = $("<div>")
            divCity.text(currentCity).addClass("btn").addClass("btn-secondary")
            searchHist.append(divCity)
    }
}    
var displayCurrentDay = function(data,currentCity) {
    //cd = current day
    $("#currentDay").html("")
    let cdInfo = $("<div>").addClass("d-flex").addClass("justify-content-center").addClass("align-middle").addClass("flex-wrap")
    $("#currentDay").append(cdInfo)
    //city name
    let pCityName = $("<p>").text(currentCity+"_").addClass("h1")
    cdInfo.append(pCityName)
    //date
    var pDate = $("<p>").text("(" + moment().format('l')+ ")").addClass("h1");
    cdInfo.append(pDate)
    //icon
    let cdImg = $("<img>")
    cdImg.attr("src","https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png")
    cdInfo.append(cdImg)
    //temperature
    let frcTemp = $("<p>")
    frcTemp.text("Temperature: "+Math.floor(data.main.temp)+" °F").addClass("h4")
    $("#currentDay").append(frcTemp)
    //humidity
    let frcHumidity = $("<p>")
    frcHumidity.text("Humidity: "+data.main.humidity+" %").addClass("h4")
    $("#currentDay").append(frcHumidity)
    //wind
    let frcWind = $("<p>")
    frcWind.text("Wind: "+data.wind.speed+" MPH").addClass("h4")
    $("#currentDay").append(frcWind)
    //UV
    let frcUV = $("<p>")
    frcUV.addClass("h4").attr("id","UV")
    $("#currentDay").append(frctext)
}

var displayDailyForecast = function(currentCity) {
    let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + currentCity + "&cnt=4&appid=" + apiKey+"&units=imperial"
    fetch(forecastQueryURL).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {    
                //store city name in local storage
                $("#forecast-cards").html("")
                for (let i = 0; i < data.list.length; i++) {
                    let forecastCard = $("<div>").addClass("card").attr("style","width:10rem;")
                    $("#forecast-cards").append(forecastCard)
                    //forecast date
                    var new_date = moment(startdate, "DD-MM-YYYY").add(i+1,'days');
                    var day = new_date.format('DD');
                    var month = new_date.format('MM');
                    var year = new_date.format('YYYY');
                    let frcstDate = $("<h5>").text("Date "+month+"/"+day+"/"+year)
                    forecastCard.append(frcstDate)
                    //img icon
                    let frcimgIcon = $("<img>")
                    frcimgIcon.attr("id","icon-day-"+(i+1)+"")
                    frcimgIcon.attr("src","https://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + "@2x.png")
                    forecastCard.append(frcimgIcon)
                    //temperature
                    let frcTemp = $("<p>")
                    frcTemp.text("Temperature: "+Math.floor(data.list[i].main.temp)+" °F")
                    forecastCard.append(frcTemp)
                    //humidity
                    let frcHumidity = $("<p>")
                    frcHumidity.text("Humidity: "+data.list[i].main.humidity+" %")
                    forecastCard.append(frcHumidity)
                    //wind
                    let frcWind = $("<p>")
                    frcWind.text("Wind: "+data.list[i].wind.speed+" MPH")
                    forecastCard.append(frcWind)
                }
                    
                
            })
        } else {
            console.log("Forecast API ERROR");
            return false
        }
    })
}

searchBox.on("click","div",function(){
    let currentCity = inputSearchEl.val()
    getWeatherConditions(currentCity);
    renderSearchHist(currentCity)
    inputSearchEl.val("")
})


searchHist.on("click","div",function(){
    getWeatherConditions($(this).text());
})

if (cities.length>0) {
    getWeatherConditions(cities[cities.length-1])    
}

renderSearchHist()