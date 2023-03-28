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

function getByStatus(status) {
    return questions.filter(q => q.status == status).length > 0;
}

function create(q, callback) {
    // generate new task id
    q.id = questions.length ? Math.max(...questions.map(x => x.id)) + 1 : 1;
    q.status = false;
    q.votes = {};
    q.users = [];

    // add and save task
    questions.push(q);
    saveData(callback);

    return q.id;
}

function updateAll(callback) {
    questions.forEach(q => {
        q.status = false;
        q.users = [];
        q.votes = {};
    });
    saveData(callback);
}



function updateOne(q, prop, value, callback) {
    // set date updated
    // q.dateUpdated = new Date().toISOString();
    if (q) {
        q[prop] = value;
        saveData(callback);
    }
}

function remove(id, callback) {
    // filter out deleted task and save
    if (id) {
        questions = questions.filter(x => x.id.toString() !== id.toString());
        saveData(callback);
    }

}


// private helper functions

function saveData(callback) {

    // try {
    //     fs.writeFileSync(fileName, JSON.stringify(questions, null, 1));
    // }
    // catch (err) {
    //     console.log(err);
    // }


    fs.writeFile(fileName, JSON.stringify(questions, null, 1), (err) => {
        if (err) throw err;
        callback();
    });

    // console.log("=..=", fileName, 'updated');
}