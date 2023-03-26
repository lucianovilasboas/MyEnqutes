const fs = require('fs');

const fileName = "./data/questions.json";

let questions = JSON.parse(fs.readFileSync(fileName)); 

module.exports = {
    getAll: () => questions,
    getById: id => questions.find(x => x.id.toString() == id),
    getByStatus,
    create,
    updateOne,
    updateAll,
    remove
};

function getByStatus( status){
    return questions.filter(q => q.status == status).length > 0;
}

function create(q) {
    // generate new task id
    q.id = questions.length ? Math.max(...questions.map(x => x.id)) + 1 : 1;
    q.status = false;
    q.votes = {}; 
    q.users = [];

    // add and save task
    questions.push(q);
    saveData();
    
    return q.id;
}

function updateAll() {
    questions.forEach(q => {
        q.status = false;
        q.users = [];
        q.votes = {};
    });    
    saveData();
}



function updateOne(q, prop, value) {
    // set date updated
    // q.dateUpdated = new Date().toISOString();

    q[prop] = value;
    saveData();
}

function remove(id) {
    // filter out deleted task and save
    questions = questions.filter(x => x.id.toString() !== id.toString());
    saveData();
    
}


// private helper functions

function saveData() {
    console.log("==>>",fileName, 'called');
    fs.writeFileSync(fileName, JSON.stringify(questions, null, 1));

    
    // fs.writeFile(fileName, JSON.stringify(questions, null, 1), (err) => {
    //     if (err) throw err;
    //     console.log("=..=", fileName, 'updated');
    // });

    console.log("=..=", fileName, 'updated');
}