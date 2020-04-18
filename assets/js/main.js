`use strict`;


const game = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    ctx: undefined,
    platform: undefined,
    ball: undefined,
    rows: 4,
    cols: 10,
    running: true,
    score: 0,
    blocks: [],

// Спрайты
    sprites: {
      background: undefined,
      platform: undefined,
      ball: undefined,
      block: undefined,
    },

// Инициализация CANVAS
    init: function(){
      const canvas = document.querySelector('#arcade');
      this.ctx = canvas.getContext('2d');
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = "#fff";
      canvas.width = this.width;
      canvas.height = this.height;

      // --- физика платформы
      window.addEventListener('keydown', function(e){
        if(e.keyCode == 37){
          game.platform.dx = -game.platform.velocity;
        } else if (e.keyCode == 39){
          game.platform.dx = game.platform.velocity;
        } else if (e.keyCode == 32){
          game.platform.releaseBall();
        };
      });
      window.addEventListener('keyup', function(e){
        game.platform.stop();
      });
    },

// Загрузка изображений
    load: function(){
      for( let key in this.sprites){
        this.sprites[key] = new Image();
        this.sprites[key].src = "../assets/img/" + key + ".png";
      }
    },

// Лоика уровней
    create: function(){
      for( let row = 0; row < this.rows; row++){
        for( let col = 0; col < this.cols; col++){
          this.blocks.push({
            x: 160 * col + 150,
            y: 90 * row + 100,
            width: 220,
            height: 100,
            isAlive: true,
          });
        };
      };
    },

// Запуск
    start: function() {
      this.init();
      this.load();
      this.create();
      this.run();
    },

// Рендер
      render: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y);



        this.blocks.forEach(function(element){
          if(element.isAlive){
            this.ctx.drawImage(this.sprites.block, element.x, element.y);
          }
        }, this);

        this.ctx.fillText("SCORE:" + this.score, 15, this.height - 25);
      },

// Логика движения объектов
      update: function(){
        if(this.ball.collide(this.platform)){
          this.ball.bumpPlatform(this.platform);
        };
        if(this.platform.dx){
          this.platform.move();
        };
        if(this.ball.dx || this.ball.dy){
          this.ball.move();
        };

        this.blocks.forEach(function(element){
          if(element.isAlive){
            if(this.ball.collide(element)){
              this.ball.bumpBlock(element);
            }
          }
        }, this);

        this.ball.checkBounds();

      },

// Инициализация отрисовки
      run: function() {
        this.update();
        this.render();

        if(this.running){
          window.requestAnimationFrame(function() {
          game.run();
          });
        };
      },
      over: function(message){
        alert(message);
        this.running = false;
        window.location.reload();
      },
};


// Настройки шара
      game.ball = {
        width:40,
        height:40,
        x: 890,
        y: 810,
        velocity:13,
        dx:0,
        dy:0,
        jump: function(){
          this.dy = -this.velocity;
          this.dx = -this.velocity;
        },
        move:function(){
          this.x += this.dx;
          this.y += this.dy;
        },
        collide: function(element){
          let x = this.x + this.dx;
          let y = this.y + this.dy;
          if(x + this.width > element.x &&
            x < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height
          ){
           return true;
           }
           return false;
        },
        bumpBlock: function(block){
          this.dy *= -1;
          block.isAlive = false;
          ++game.score;
          if(game.score >= game.blocks.length){
            game.over('You Win!!!');
          };
        },
        onTheLeftSide: function(platform){
          return (this.x + this.width / 2) < (platform.x + platform.width / 2);
        },
        bumpPlatform: function(platform){
          this.dy = -this.velocity;
          this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
        },
        checkBounds: function(){
          let x = this.x + this.dx;
          let y = this.y + this.dy;

          if( x < 0 ){
            this.x = 0;
            this.dx = this.velocity;
          } else if( x + this.width > game.width){
            this.x = game.width - this.width;
            this.dx = -this.velocity;
          } else if( y < 0 ){
            this.y = 0;
            this.dy = this.velocity;
          } else if( y + this.height > game.height ){
            game.over('Game Over');
            // game over
          }
        },
      };

// Настройки платформы
      game.platform = {
        x: 780,
        y: 850,
        velocity:26,
        dx: 0,
        width: 250,
        height:38,
        ball: game.ball,
        releaseBall: function(){
          if(this.ball){
            this.ball.jump();
            this.ball = false;
          };
        },
        move:function(){
          this.x += this.dx;
          if(this.ball){
            this.ball.x += this.dx;
          }
        },
        stop: function(){
          this.dx = 0;
          if(this.ball){
            this.ball.dx = 0;
          }
        },
      };


document.addEventListener('DOMContentLoaded', () => {
game.start();
});
