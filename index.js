require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const fitnessCalculator = require("fitness-calculator");
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const mongoose = require("mongoose")

mongoose.connect('mongodb://127.0.0.1:27017/')

const APIkey = process.env.APIKEY;
const port = 3000;
const app = express();
const API_URL= "https://api.spoonacular.com/recipes/";
const config = {
    headers: { "x-api-key":`${APIkey}` },
  };

app.use(express.static(`./public`));
app.use(bodyParser.urlencoded({extended:true}));



const fitCalc = function() {
const ht = $("#calc").val();
const wt = $("#calc").val();
const age = $("#calc").val();
const gender = $("#calc").val();
const activity = $("#calc").val();
const bmi = fitnessCalculator.BMI(ht,wt);
const IdWt = fitnessCalculator.idealBodyWeight(gender,ht);
const calorieIntake = fitnessCalculator.calorieNeeds(gender,age,ht,wt,activity);
console.log(bmi,IdWt,calorieIntake)
}
$("#calc").on(`click`,fitCalc)

app.get("/", async (req,res)=>{
    try {
        const result = await axios.get(API_URL+ "random?number=3",config);
        const recipes = result.data.recipes
            res.render("home.ejs", {
            recipes:recipes,
        });     
      } catch (error) {
        console.log(error);
        res.status(500);
      }
})

app.post(`/recipe/:postName`, async (req,res)=>{
    try {
        const recipeId = req.body.recipeid;
        const result = await axios.get(API_URL+ recipeId + "/information", config);
        const recipes= result.data;
            res.render("page.ejs", {
                recipeTitle:recipes.title, 
                recipeImage:recipes.image, 
                recipeSumm:recipes.summary.replaceAll("^\"|\"$", ""),
                recipeIns:recipes.instructions
            }); 
        } catch (error) {
            console.log(error);
            res.status(500);
          } 
  });

  app.get("/search", async (req,res) => {
    const result = await axios.get(API_URL+"/complexSearch?",config)
    const searchRecipes = result.data.results
    res.render("search.ejs", {
      searchRecipes:searchRecipes
    })
  })


  app.post("/search", async (req,res) => {
    try {
        const query = req.body.recipe;
        const queryPar = `&query=${query}`;
        const diet = req.body.diet;
        const dietPar = `&diet=${diet}`;
        const cuisine = req.body.cuisine;
        const cuisinePar = `&cuisine=${cuisine}`;
        const type = req.body.type;
        const typePar = `type=${type}`;
        const intolerances = req.body.intolerances;
        const intolerancesPar = `&intolerances=${intolerances}`
        const result = await axios.get(API_URL+"/complexSearch?" + queryPar + dietPar + cuisinePar + 
        typePar + intolerancesPar + "&number=5" , config);
        const searchRecipes= result.data.results;
            res.render("search.ejs", {
                searchRecipes:searchRecipes
            }); 
        } catch (error) {
            console.log(error);
            res.status(500);
          }  
  })


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}` )
});