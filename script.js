const files = ["a_example", "b_lovely_landscapes", "c_memorable_moments", "d_pet_pictures", "e_shiny_selfies"];
let fs = require('fs');
let photos;

files.forEach(v => comp(v));

function comp(fileName) {
    let start = new Date().getTime();
    let obj = fs.readFileSync(`${fileName}.txt`, 'utf8').toString();
    photos = obj.split("\n").map(v => v.split(' '));
    photos = photos.slice(1, photos.length);
    photos = photos.map((v, i) => {
        v.i = i;
        return v;
    });

    let best = getBest();
    generateFile(best, fileName);
    console.log(`${new Date().getTime() - start}ms: ${fileName} - ${eval(best)}`);
}

function generateFile(slides, fileName) {
    var stream = fs.createWriteStream(`${fileName}_export.txt`);
    stream.once('open', function (fd) {
        stream.write(`${slides.length}\n`);
        slides.forEach(v => stream.write(`${v.reduce((t, v) => t += " " + v, "")}\n`));
        stream.end();
    });
}

function getBest() {
    let slides = genSlides(),
        biggest = eval(slides);
    for (let i = 0; i < 50; i++) {
        let temp = shuffle(slides),
            tot = eval(temp);
        if (tot > biggest) {
            biggest = tot;
            slides = temp;
        }
    }
    return slides;
}

function genSlides() {
    let V = photos.filter(v => v[0] == 'V'),
        H = photos.filter(v => v[0] == 'H'),
        slides = [];

    for (let i = 0; i < V.length; i += 2) {
        slides.push([V[i].i, V[i + 1].i]);
    }

    H.forEach(v => slides.push([v.i]));

    return slides;
}

function eval(slideshow) {
    return slideshow.reduce((sum, val, i, arr) => {
        let t = (i != arr.length - 1) ? compare(val, arr[i + 1]) : 0; // not end
        return sum + t;
    }, 0);
}

function compare(a, b) {
    let a_tags = getTags(a),
        b_tags = getTags(b);
    let a_tot = onlyIn(a_tags, b_tags),
        union = unionCount(a_tags, b_tags),
        b_tot = onlyIn(b_tags, a_tags);
    return Math.min(a_tot, union, b_tot);
}

function unionCount(a, b) {
    let t = 0;
    a.forEach(v => {
        if (b.includes(v)) t++;
    });
    return t;
}

function onlyIn(a, b) {
    let unique = 0;
    a.forEach(v => {
        if (!b.includes(v)) unique++;
    });
    return unique;
}

function getTags(indexes) {
    let tags = [];
    indexes.forEach(i => {
        photos[i].forEach((v, i) => {
            if (i >= 2) tags.push(v);
        });
    });
    return tags.filter(onlyUnique);
}

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates/16065720
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}