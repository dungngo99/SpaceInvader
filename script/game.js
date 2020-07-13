/* Initialization.
Here, we create and add our "canvas" to the page.
We also load all of our images. 
*/

const cvs = document.getElementById('myCanvas');
const ctx = cvs.getContext('2d');

//Styling text
ctx.font = '30px Georgia'
ctx.fillStyle = 'red'
ctx.textAlign = 'center'

//Initialize all images
const heroImg1 = new Image();
heroImg1.src = 'images/craft1.png';

const heroImg2 = new Image();
heroImg2.src = 'images/craft2.png'

const heroImg3 = new Image();
heroImg3.src = 'images/craft3.png'

const heroImg4 = new Image();
heroImg4.src = 'images/craft4.png'

const heroImg5 = new Image();
heroImg5.src = 'images/craft5.png'

const monsterImg1 = new Image();
monsterImg1.src = 'images/monster1.png';

const monsterImg2 = new Image();
monsterImg2.src = 'images/monster2.png';

const monsterImg3 = new Image();
monsterImg3.src = 'images/monster3.png';

const monsterImg4 = new Image();
monsterImg4.src = 'images/monster4.png';

const bgImg = new Image();
bgImg.src = "https://www.astrobio.net/images/galleryimages_images/Gallery_Image_10257.jpg";

const bulletImg = new Image();
bulletImg.src = 'images/bullet.png';

const headImg = new Image();
headImg.src = 'images/header.png';

const gameoverImg = new Image();
gameoverImg.src = 'images/gameover.png'

const invaderBImg = new Image();
invaderBImg.src = 'images/redStick.png'

const explosionSprite = new Image();
explosionSprite.src = 'images/explosion.png'

//Initialize all audios
const spaceInvaderAudio = new Audio();
spaceInvaderAudio.src = 'audios/InvaderSound.wav'
spaceInvaderAudio.loop = true

const heroShootAudio = new Audio();
heroShootAudio.src = 'audios/shoot.wav'

const invaderKilledAudio = new Audio();
invaderKilledAudio.src = 'audios/invaderkilled.wav'

const invaderShootAudio = new Audio();
invaderShootAudio.src = 'audios/ufo_highpitch.wav'

const heroKilledAudio = new Audio();
heroKilledAudio.src = 'audios/explosion.wav';

const reloadAudio = new Audio();
reloadAudio.src = 'audios/reload.mp3'

const gameoverAudio = new Audio();
gameoverAudio.src = 'audios/gameover.wav'

const winAudio = new Audio();
winAudio.src = 'audios/win.wav'

//Record frames and other global variables
let frames = 0
const SECONDS_PER_ROUND = 30;
const FRAME_SIZE = 700;
let elapsedTime = 0;
let keysDown = { 16: false, 38: false, 40: false, 37: false, 39: false };
const INFOR = { 'name': 'NoName', 'level': 'Easy', 'spaceship': 'Rhoder','speed':5,'time':5,'result':'Success'}

/*
This object keep track of the current state of the game. There are 3 states: getReady, playing, and game-over
*/
const state = {
  current: 0,
  getReady: 0,
  play: 1,
  over: 2,
}

//CLICK: Click objects
const click = {
  is_clicked: false,
  //Add event listener
  eventListen: function () {
    addEventListener('click', function (evt) {
      if (!this.is_clicked){
        spaceInvaderAudio.play()
        is_clicked = true
      }
      // Find the coordinates (x,y) of user's click with respect to the (x,y) of canvas
      let rect = cvs.getBoundingClientRect()
      clickX = evt.clientX;
      clickY = evt.clientY;

      // Check whether user clicks on the canvas or not
      if (clickX >= rect.x && clickX <= rect.x + rect.width && clickY >= rect.y && clickY <= rect.y + rect.height) {
        switch (state.current) {          //If user is in getReady state, move to playing state
          case state.getReady:            
            reloadAudio.play()
            state.current = state.play;
            break;
          case state.play:                //If user is in playing state, stay in this state (disable click)
            state.current = state.play;
            break;
          case state.over:                //If user is in game-over state, move to getReady state
            reloadAudio.play()
            state.current = state.getReady;
            break;
        }
      }
    })
  }
}
//Initialize event listener
click.eventListen();

//BACKGROUND: Background objects
const bgs = {
  header_size: FRAME_SIZE * 3 / 7,
  positions: [],      //Store all frames for background
  startTime: 0,       //Record the starting time for count-down
  is_add: false,      //Check if all frames are added right before the playing state
  is_called: false,   //Check if counting down already started (only count down once)
  w: FRAME_SIZE,      //Width of the background
  h: FRAME_SIZE,      //Height of the background  
  x: 0,               //X-coor of the background
  y: 0,               //Y-coord of the background

  //Draw the background after calling update()
  draw: function () {
    // Draw all background frames existing in positions array
    for (let i = 0; i < this.positions.length; i++) {
      let bg = this.positions[i];
      ctx.drawImage(bgImg, bg.x, bg.y, bg.w, bg.h);
    }
  },

  //Update the background after calling draw()
  update: function () {
    if (state.current === 0) {                  //If the user is in getReady state, only draw 1 frame and a header
      ctx.drawImage(bgImg, 0, 0, this.w, this.h);
      ctx.drawImage(headImg, this.w / 2 - this.header_size / 2, this.h / 2 - this.header_size / 2, this.header_size, this.header_size)
      this.reset()

      //When user is in gerReady state, the submit button is enabled
      document.getElementById('dn-submit').disabled = false
    }

    else if (state.current === 1) {             //If the user is in playing state, keep moving frames to make everything seems moving
      //When user is in playing state, the submit button is disabled
      document.getElementById('dn-submit').disabled = true
      
      // Start the timer - Only call once
      if (!this.is_called) {
        startTime = Date.now();
        this.is_called = true;
      }

      //Add 3 frames to the positions array as initialization - Only call once
      if (!this.is_add) {
        for (let i = 0; i < 3; i++) {
          let bg = { w: this.w, h: this.h, x: 0, y: 0 - FRAME_SIZE * i }
          this.positions.push(bg)
        }
        this.is_add = true;
      }

      //Loop through all frames to update their positions (y-coord)
      for (let i = 0; i < this.positions.length; i++) {
        bg = this.positions[i];
        bg.y += 5;

        //If frames go out of canvas, remove it and add a new bg object
        if (bg.y >= bg.w) {
          this.positions.shift();
          this.positions.push({ w: this.w, h: this.h, x: 0, y: bg.x - FRAME_SIZE * 2 })
        }

        //Count the remaining time and display it for user
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        let timeleft = SECONDS_PER_ROUND - elapsedTime;
        ctx.fillText(`Seconds Remaining: ${timeleft}`, 170, 30);

        //If there is no time left, move to game-over state
        if (timeleft === 0) {
          state.current = state.over;
          gameoverAudio.play();
        }
      }
    } else {                                     //If the user is in the game-over state, add 1 frame and a header
      ctx.drawImage(bgImg, 0, 0, this.w, this.h);
      ctx.drawImage(gameoverImg, cvs.width / 2 - this.header_size / 2, cvs.height / 2 - this.header_size / 2 + 50, this.header_size, this.header_size)
      ctx.fillText('Click to restart', cvs.width / 2, cvs.height / 2 - 50);
      this.reset();

      //When user is in Game-over state, the submit button is enabled
      document.getElementById('dn-submit').disabled = false
    }
  },

  //Reset all attributes of Background object
  reset: function () {
    this.positions = [];
    this.is_add = false;
    elapsedTime = 0;
    this.is_called = false;
  }
}

// HERO: hero object
const hero = {
  x: 100,               //X-coord of hero object
  y: 100,               //Y-coord of hero object
  w: 40,                //width of hero object
  h: 40,                //height of hero object
  numLives: 5,          //Total number of lives a hero can have
  lives: this.numLives, //Keep track of number of lives left
  heroImgs: [heroImg1, heroImg2, heroImg3, heroImg4, heroImg5],
  heroIndex: 0,

  //Draw a hero object from an array of heros on Canvas after updating it
  draw: function () {
    ctx.drawImage(this.heroImgs[this.heroIndex], this.x, this.y, this.w, this.h);
  },

  //Update the hero object after drawing it
  update: function () {
    if (state.current === state.getReady) {                         //If the user is in getReady state, do nothing 
      this.reset();
      return;
    }
    else if (state.current === state.play) {                        //If the user is in playing state, do something
      //Allow the hero to teleport through edges of the Canvas, based on its current position.
      if (hero.w + hero.x > bgs.w) hero.x = 0;
      if (hero.x < bgs.x) hero.x = bgs.w - hero.w;
      if (hero.h + hero.y >= bgs.h) hero.y = 0;
      if (hero.y < bgs.y) hero.y = bgs.h - hero.h;

      //Display the number of lives left of hero
      ctx.fillText(`Live: ${this.lives}`, 60, 70)

      //Collision Detection with Monsters: Loop through each monster object and compare its position with current hero's position
      for (let i = 0; i < monsters.positions.length; i++) {
        let monster = monsters.positions[i];

        //If monster is already dead, ignore its position
        if (monster === null) {
          continue;
        }

        //Otherwise, check whether hero touches a monster
        if ((monster.x <= hero.x + hero.w) && (monster.x + monster.w >= hero.x)
          && (monster.y <= hero.y + hero.h) && (monster.y + monster.h >= hero.y)) {

          //If yes, move the hero back to original position
          hero.x = bgs.w / 2 - this.w / 2;
          hero.y = bgs.h / 1.2 + this.h;

          //Both hero and that monster are destroyed. Monster is disappeared.
          monsters.positions[i] = null;

          //Hero lost 1 life and play audio effect
          this.lives -= 1;
          heroKilledAudio.play();

        }
      }

      //Collision Detection with Monster's bullets: loop through all bullets and compare their positions with hero's
      for (let i = 0; i < bulletsMonster.positions.length; i++) {
        let bullet = bulletsMonster.positions[i];

        //Check if the hero touches a bullet i's positions
        if ((bullet.x <= hero.x + hero.w) && (bullet.x + bullet.w >= hero.x)
          && (bullet.y <= hero.y + hero.h) && (bullet.y + bullet.h >= hero.y)) {

          //If yes, move the hero back to original position
          hero.x = bgs.w / 2 - this.w / 2;
          hero.y = bgs.h / 1.2 + this.h;

          //The bullet is exploded with hero
          bulletsMonster.positions[i].y = bgs.h;

          //Hero lost 1 life and play audio effect
          this.lives -= 1;
          heroKilledAudio.play()
        }
      }
      //If hero uses all his lives, move to game-over state (hero failed his mission)
      if (this.lives === 0) {
        state.current = state.over
        gameoverAudio.play()

        //Update the UI Table when the game is over
        updateTable.update('Fail', )
      }

    } else {                                                    //If the user is in game-over state, do nothing
      this.reset();
      return;
    }
  },

  //Reset all attributes of hero object back to originals
  reset: function () {
    this.lives = this.numLives;
    this.x = bgs.w / 2 - this.w / 2;
    this.y = bgs.h / 1.2 + this.h;
  }
}

//BULLETSHERO: All bullets objects of hero object
const bulletsHero = {
  positions: [],            //Store all bullet object in an array
  period: 10,               //The time interval of hero's bullets
  speed: 5,                 //How fast the hero's bullets are shot

  //Draw the hero's bullets after updating
  draw: function () {
    //Iterate through every bullet to update its position
    for (let i = 0; i < this.positions.length; i++) {
      let bullet = this.positions[i];
      ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.w, bullet.h);
    }
  },

  //Update the hero's bullets after drawing
  update: function () {
    if (state.current === state.getReady) {                           //If the user is in getReady state, do nothing
      this.positions = []
      return;
    }

    else if (state.current === state.play) {                          //If the user is in playing state, do something
      //Hero can only shoot if user presses SHIFT key.
      if (keysDown[16]) {
        //When Shift key is pressed, user can only shoot every an fixed time interval
        if (frames % this.period === 0) {
          let bullet = {
            x: hero.x + hero.w / 3.5,
            y: hero.y - hero.h / 2.5,
            w: 20,
            h: 20,
          }
          //Add bullets to positions array and play audio effect
          this.positions.push(bullet)
          heroShootAudio.play()
        }
      }

      //Iterate through every bullet to move it up (y-coord)
      for (let i = 0; i < this.positions.length; i++) {
        this.positions[i].y -= this.speed;

        //If the bullets are out of canvas, shift the first bullet, which is always the first bullet out of frame
        if (this.positions[i].y <= bgs.y) {
          this.positions.shift();
        }
      }

    } else if (state.current === state.over) {                        //If the user is in the game-over state, do nothing
      this.positions = []
      return;
    }
  }
}

// MONSTERS: All monster objects
const monsters = {
  numMonsters: 40,                  //Fixed number of monsters appeared on Canvas
  positions: [],                    //Store all monster objects in an array
  is_draw: false,                   //Check if all monsters are added to positions array
  X: 100,                           //X-coord of the first monster
  Y: 100,                           //Y-coord of the first monster
  monsterImgs: [monsterImg1, monsterImg2, monsterImg3, monsterImg4], //Array to store all monster images

  //Draw the monsters to Canvas after updating them
  draw: function () {
    //Iterate through every monster
    for (let j = 0; j < this.positions.length; j++) {
      //If the monster is already dead, don't draw it to Canvas
      if (this.positions[j] === null) {
        continue;
      }
      //Get the monster object and draw it with its position
      let monster = this.positions[j]
      ctx.drawImage(this.monsterImgs[j % 4], monster.x, monster.y, monster.w, monster.h)
    }
  },

  //Update the monsters after drawing them
  update: function () {
    if (state.current === state.getReady) {                     //If the user is in the getReady state, do nothing
      this.positions = []
      this.is_draw = false
      return
    } else if (state.current === state.play) {                  //If the user is in the playing state, do something 
      //Check if all monsters are added to positions array
      if (!this.is_draw) {
        for (let i = 0; i < this.numMonsters / 4; i++) {
          for (let j = 0; j < 4; j++) {
            //Arrange monsters by 10 by 4 table
            let monster = { x: this.X + i * 50, y: this.Y + j * 50, w: 40, h: 40 }
            this.positions.push(monster);
          }
        }
        //Mark as added - Only add once
        this.is_draw = true;
      }

      //Check if all monsters are dead. If yes, hero completes his missions. Otherwise, continue
      let isWin = true;
      for (let j = 0; j < this.positions.length; j++) {
        if (this.positions[j] != null) {
          isWin = false;
        }
      }

      //If the hero wins, move to game-over state and play audio effect
      if (isWin) {
        state.current = state.over;
        winAudio.play();
        updateTable.update('Success');
        return;
      }

      //Collision Detection: loop through every monster to check whether it is shot by hero's bullet
      for (let j = 0; j < this.positions.length; j++) {
        //If a monster is already dead, ignore it
        let monster = this.positions[j];
        if (monster === null) {
          continue;
        }

        //Iterate through hero's bullets. Compare given monster's position with each hero's bullet's position
        for (let i = 0; i < bulletsHero.positions.length; i++) {
          //Since we loop through an array, we want to make sure the length is fixed and consistent
          let bullet = bulletsHero.positions[i];

          //If a bullet no longer exists, ignore it.
          if (bullet === 0) {
            continue;
          }

          // Check if a bullet and monster collide.
          if (monster.x <= bullet.x + bullet.w && bullet.x <= (monster.x + monster.w)
            && monster.y <= bullet.y + bullet.h && bullet.y <= (monster.y + monster.h)) {

            //Implicitly remove a bullet and a monster from its corresponding positions array 
            bulletsHero.positions[i] = 0;
            monsters.positions[j] = null;
            invaderKilledAudio.play()

            //Since the monster is dead, there is no need to compare its position with other bullets.
            break;
          }
        }
      }
    } else {                                               //If the user is in game-over state, do nothing
      this.positions = []
      this.is_draw = []
      return
    }
  }
}

//BULLETS: All bullet objects of monster objects
const bulletsMonster = {
  positions: [],              //An array to store all bullet objects that monsters shot out
  period: 120,                //A time interval for a group of monster shot out
  speed: 2,                   //Spped of each bullet
  numBullets: 5,              //Number of bullets in each time interval
  w: 10,                      //Width of each bullet
  h: 20,                      //Height of each bullet

  //draw bullets after updating them
  draw: function () {
    //Iterate through each bullet and update their positions
    for (let i = 0; i < this.positions.length; i++) {
      let bullet = this.positions[i]
      ctx.drawImage(invaderBImg, bullet.x, bullet.y, bullet.w, bullet.h)
    }
  },

  //update bullets after drawing them
  update: function () {
    if (state.current === state.getReady) {                       //If the user is in getReady state, do nothing
      this.positions = []
      return
    } else if (state.current === state.play) {                    //If the user is in playing state, do something
      //Bullets are only shot every particular interval of time
      if (frames % this.period === 0) {
        let chooseMons = [];

        //Check whether we gather enough monsters as candidates to shoot bullets
        while (chooseMons.length != this.numBullets) {
          //Choose a random number froom 0 to 39 (this is index of monsters in positions array)
          let num = Math.floor(Math.random() * monsters.numMonsters) - 1;

          //If a monster still survives, it can shoot out a bullet. Otherwise, ignore it
          if (monsters.positions[num]) {
            //Record that number in the redefined array
            chooseMons.push(num)

            //Get the monster from given index num
            let monster = monsters.positions[num];

            //Construct a bullet object
            let bullet = {
              x: monster.x + monster.w / 2 - this.w / 2,
              y: monster.y + monster.h + 10,
              w: this.w,
              h: this.h
            }

            //Add that bullet to positions array
            this.positions.push(bullet)
          }
        }
        //Play sound effect of shooting
        invaderShootAudio.play()
      }

      //Iterate through each bullet to update its position
      for (let i = 0; i < this.positions.length; i++) {
        //Move the bullet downs
        this.positions[i].y += this.speed;

        //Check if a bullet is out of frame of Canvas. if yes, remove the first bullet object
        //from array since it indicates that this object must be out of canvas first
        if (this.positions[i].y >= bgs.h + 200) {
          this.positions.shift();
        }
      }
    } else {                                                    //If the user is in game-over state, do nothing
      this.positions = []
      return
    }
  }
}

//EXPLOSION: this object simulate the effect of explosion
const explosion = {
  prev_x: 0,                                //Save the previous x-coord of hero object
  prev_y: 0,                                //Save the previous y-coord of hero object
  exploded: false,                          //Check if the monster or hero is already exploded
  count: 0,                                 //Record the number of states of explosion
  x: [41, 144, 256, 371, 491, 8, 134],      //X-coord of each explosion from explosion sprite
  y: [45, 23, 11, 3, 2, 132, 133],          //Y-coord of each explosion from explosion sprite
  w: [42, 78, 102, 112, 111, 106, 101],     //Width of each explosion from explosion sprite
  h: [42, 72, 97, 115, 112, 103, 101],      //Height of each explosion from explosion sprite

  //Draw the explosion state one by one after updating it
  draw: function () {
    //If we reach all frames, the explosion is done
    if (this.count != this.x.length) {
      //Draw each explosion state
      ctx.drawImage(explosionSprite,
        this.x[this.count], this.y[this.count], this.w[this.count], this.h[this.count],
        this.prev_x, this.prev_y, hero.w, hero.h)

      //Increment the count
      this.count++
    } else {
      //Reset attributes of explosion object
      this.reset();
    }
  },

  //Explosion for hero object
  explodeHero: function () {
    this.exploded = true;
    this.prev_x = hero.x;
    this.prev_y = hero.y
  },

  //Explosion for monster object
  exploreMonster: function () {
    this.exploded = true;
    this.prev_x = monster.x;
    this.pre_x = monster.x;
  },

  //Reset the explosion
  reset: function () {
    this.exploded = false
    this.is_draw = false
    this.count = 0
  }
}

// KEYBOARD: manage keyboard
const keyBoard = {
  eventListen: function () {
    addEventListener('keydown', function (key) {
      keysDown[key.keyCode] = true;
    }, false);
    addEventListener('keyup', function (key) {
      keysDown[key.keyCode] = false;
    }, false);
  },
  update: function () {
    if (state.current === state.getReady) {
      return;
    } else if (state.current === state.play) {
      if (keysDown[38]) hero.y -= 5;// Player is holding up key
      if (keysDown[40]) hero.y += 5; // Player is holding down key
      if (keysDown[37]) hero.x -= 5; // Player is holding left key
      if (keysDown[39]) hero.x += 5; // Player is holding right key
    } else {
      return;
    }
  }
}
keyBoard.eventListen();

// AUDIO: add-ons effects for audio. User can custom audio volume.
const audio = {
  //Set up volume for all sound effects
  setupDefault: function () {
    spaceInvaderAudio.volume = 0.1
    heroShootAudio.volume = 0.5
    invaderKilledAudio.volume = 0.5
    invaderShootAudio.volume = 0.5
    heroKilledAudio.volume = 0.5
    reloadAudio.volume = 1
    gameoverAudio.volume = 1
    winAudio.volume = 1
  },

  //Set the buttons to actively listen to user's clicks
  setActive: function () {
    //Turn on all sound effects to default value
    document.getElementById('dn-turn-on').addEventListener('click', function (evt) {
      audio.setupDefault()
    })

    //Turn off all sound effects to default value
    document.getElementById('dn-turn-off').addEventListener('click', function(evt){
      spaceInvaderAudio.volume = 0
      heroShootAudio.volume = 0
      invaderKilledAudio.volume = 0
      invaderShootAudio.volume = 0
      heroKilledAudio.volume = 0
      reloadAudio.volume = 0
      gameoverAudio.volume = 0
      winAudio.volume = 0
    })
  },
}
audio.setupDefault()
audio.setActive()

//SUBMIT: An object submit
const submit = {
  //Store the user's current submitted information
  submitForm: null,

  //submit() has an EventListener for submit button
  submit: function(){
    //If the user does not click submit, the program always use default settings
    document.getElementById('dn-submit').addEventListener('click', function(evt){
      //Display to the user that his/her information has been stored in the database
      document.getElementById('dn-information-text').innerText = 'Your information has been submitted.'
      this.submitForm = INFOR;

      //Get all values from UI Form
      let name = document.getElementById('dn-name-').value
      let level = document.getElementById('dn-level').value
      let speed = document.getElementById('dn-speed').value
      let ship = document.getElementById('dn-spaceship').value

      //If the user don't enter name but click submit, use default name
      if (name != ''){
        this.submitForm['name'] = name
      }
      
      //Update the new information to submitForm array
      this.submitForm['level'] = level
      this.submitForm['speed'] = speed
      this.submitForm['spaceship'] = ship

      //Update heor's spped
      bulletsHero.speed = speed

      //Update spaceship
      switch(ship){
        case 'Rhoder':
          hero.heroIndex = 0
          break;

        case 'White monster':
          hero.heroIndex = 1
          break;

        case 'Captain black':
          hero.heroIndex = 2
          break;

        case 'Grey Monster':
          hero.heroIndex = 3
          break;

        case 'Terminator':
          hero.heroIndex = 4
          break
      }

      //Update level for the current game
      switch (level){
        case 'Easy':
          bulletsMonster.period = 120;
          bulletsMonster.numBullets = 5;
          bulletsMonster.speed = 2;
          break;

        case 'Medium':
          bulletsMonster.period = 70;
          bulletsMonster.numBullets = 7;
          bulletsMonster.speed = 5;
          break;

        case 'Hard':
          bulletsMonster.period = 50;
          bulletsMonster.numBullets = 10;
          bulletsMonster.speed = 10;
          break;
      }
    })
  }
}
submit.submit()

//UPDATETABLE: an object to update information in UI Table after game is over
const updateTable = {
  update: function(result){
    //If the user did not submit form before playing, use default settings
    if (submit.submitForm === null){
      submit.submitForm = INFOR
    }

    //Update result and time after a game is over
    submit.submitForm['result'] = result
    submit.submitForm['time'] = elapsedTime

    //Get the table and add one row at the end
    let table = document.getElementById('myTable')
    let row = table.insertRow(-1)
    let i = 0

    //Display information to the table
    for (key in submit.submitForm){
      let cell = row.insertCell(i)
      cell.innerText = submit.submitForm[key]
      i++
    }

    //Reset all variables user changed so far to default values
    this.reset();
  },

  reset: function(){
    //Reset all setings to default values
    bulletsMonster.period = 120;
    bulletsMonster.numBullets = 5;
    bulletsMonster.speed = 2;
    hero.heroIndex = 0

    //Reset all values in UI Form
    document.getElementById('dn-name-').value = ''
    document.getElementById('dn-level').value = 'Easy'
    document.getElementById('dn-speed').value = 5
    document.getElementById('dn-spaceship').value = 'Rhoder'

    //Reset the form to be null and reset information text in UI
    submit.submitForm = null
    document.getElementById('dn-information-text').innerText = 'Please submit your information...'
  }
}

//UPDATE: Call update functions of all objects
function update() {
  bgs.update();
  hero.update();
  monsters.update();
  bulletsHero.update();
  bulletsMonster.update();
  keyBoard.update();
};

//DRAW: call draw() function of all objects
function draw() {
  bgs.draw();
  hero.draw();
  monsters.draw();
  bulletsHero.draw();
  bulletsMonster.draw();
};

//LOOP: The main game loop. Most every game will have two distinct parts: draw() and update()
function loop() {
  frames++;
  //draw (based on the state of our game, draw the right things)
  draw();

  //update (updates the state of the game, in this case our hero and monster)
  update();

  //Recursively call loop 100 times every 1 second
  requestAnimationFrame(loop);
};

// Let's play this game!
loop()