const express = require("express")
const app = express()
const {engine} = require("express-handlebars")
const fs = require("fs")
const bodyParser = require("body-parser")
const path = require("path")

const tarefas = require("./tarefas.json")
const PORT = process.env.PORT || 8083

// Config

    // Template engine

    app.engine("handlebars", engine({defaultLayout: "main"}))
    app.set("view engine", "handlebars")

    // Body Parser

    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())

    // Public

    app.use(express.static(path.join(__dirname, "/public")))

// Rotas

app.get("/", (req, res) => {
    res.render("home", {tarefas: tarefas.tarefas, hasTask: tarefas.hasTaskz})
})

app.post("/post", (req, res) => {
    if(tarefas["hasTask"] == false) {
        tarefas["hasTask"] = true
    }

    const dataDividida = req.body.dataLimite.split("-")
    const dia = dataDividida[2]
    const mes = dataDividida[1]
    const ano = dataDividida[0]
    const dataFormatada = `${dia}-${mes}-${ano}`

    tarefas["tarefas"].push({
        id: Number(tarefas.proximoId),
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        dataLimite: dataFormatada,
        pending: true
    })

    tarefas["proximoId"] += 1

    fs.writeFile("tarefas.json", JSON.stringify(tarefas, null, 2), (err) => {
        if (err) throw err;
    })

    res.redirect("/")
})

app.post("/deletar", (req, res) => {
    tarefas["tarefas"].forEach((tarefa, index) => {
        if (tarefa.id == req.body.ID) {
            tarefas["tarefas"].splice(index, 1)
        }
    })

    if(tarefas["tarefas"].length == 0) {
        tarefas["hasTask"] = false
    }

    fs.writeFile("tarefas.json", JSON.stringify(tarefas, null, 2), (err) => {
        if (err) throw err;
    })

    res.redirect("/")
})

app.post("/concluir", (req, res) => {
    tarefas["tarefas"].forEach((tarefa, index) => {
        if (tarefa.id == req.body.ID) {
            tarefas["tarefas"][index]["concluded"] = true
            delete tarefas["tarefas"][index]["pending"]
        }
    })

    fs.writeFile("tarefas.json", JSON.stringify(tarefas, null, 2), (err) => {
        if (err) throw err;
    })

    res.redirect("/")
})

app.listen(PORT, function() {
    console.log("Servidor rodando!")
})