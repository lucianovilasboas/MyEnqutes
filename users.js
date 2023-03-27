const fs = require('fs');
const fileName = "./data/users.json";

let users = JSON.parse(fs.readFileSync(fileName));


module.exports = {
    getAll: () => users,
    getById: id => users.find(x => x.id.toString() == id.toString()),
    getByEmail: email => users.find(u => u.email.toString() == email.toString()),
    create,
    updateOne,
    clearAll,
    remove,
    random,
    sortudos
}


function create(user) {
    // add and save task
    users.push(user);
    saveData();

    return user.id;
}

function clearAll() {
    users.forEach(u => {
        u.is_sort = false;
    });
    saveData();
}



function updateOne(user, keyValueMap) {
    if (user) {
        for (const [key, value] of Object.entries(keyValueMap)) {
            user[key] = value;
        }
        saveData();
    }
}

function remove(id) {
    if (id) {
        users = users.filter(x => x.id.toString() !== id.toString());
        saveData();
    }

}




function random() {

    let usersCopy = [];

    for (i = 0; i < users.length; i++) {
        if (users[i].type != "admin" && !users[i].is_sort && users[i].online) {
            usersCopy.push(users[i]);
        }
    }

    if (usersCopy.length > 0) {
        let randomIndex = parseInt(Math.random() * usersCopy.length);
        usersCopy[randomIndex].is_sort = true;
        return usersCopy[randomIndex];
    }
    return null;
}


function sortudos() {
    return users.filter(u => u.is_sort);
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}



// private helper functions
function saveData() {
    try {
        fs.writeFileSync(fileName, JSON.stringify(users, null, 1));
    }
    catch (err) {
        console.log(err);
    }

}