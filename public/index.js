//paperscript (paperjs)

//'index' page

$(document).ready(function() {

  //common metrics
  var vs = view.size;
  var vsw = vs.width;
  var vsh = vs.height;
  var vss = view.size / 10;
  var vssw = vss.width;
  var vssh = vss.height;

  //pre-load resources
  Promise.all([
    //imgs
    RasterImport_size1('./imgs/phonehand.png'),
    SVGImport_size1('./imgs/arrow-circle-right.svg'),
    SVGImport_size1('./imgs/arrow-circle-left.svg'),
    SVGImport_size1('./imgs/hand-point-right-regular.svg'),
    SVGImport_size1('./imgs/listen-icon.svg'),
    SVGImport_size1('./imgs/iconmonstr-plus-4.svg'),
    SVGImport_size1('./imgs/iconmonstr-minus-4.svg'),
    //clap
    AudioImport_p5("./audio/clap@2/" + ("0" + getRandomInt(1, 2)).slice(-2) + ".mp3"),
    //beach_sounds page 1 ==> 7
    AudioImport("./audio/beach/합주.mp3"),
    AudioImport("./audio/beach/낙엽.mp3"),
    AudioImport("./audio/beach/새소리.mp3"),
    AudioImport("./audio/beach/물장구.mp3"),
    AudioImport("./audio/beach/이름들.mp3"),
    AudioImport("./audio/beach/물방울.mp3"),
    AudioImport("./audio/beach/사람들.mp3"),
    //beach_sounds page 2 ==> 7
    AudioImport("./audio/beach/나무리듬.mp3"),
    AudioImport("./audio/beach/바람개비.mp3"),
    AudioImport("./audio/beach/일이삼사.mp3"),
    AudioImport("./audio/beach/뻐꾸기웃음.mp3"),
    AudioImport("./audio/beach/모래던지기.mp3"),
    AudioImport("./audio/beach/귀요미물소리.mp3"),
    AudioImport("./audio/beach/하모니카와멜로디온.mp3"),
    //
  ]).then(function(imports) {
    //imgs
    var phonehand = imports[0];
    var anext = imports[1];
    var aprev = imports[2];
    var hand = imports[3];
    var iconsound = imports[4];
    var plus = imports[5];
    var minus = imports[6];
    //clap
    var clap = imports[7];
    //beach list
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_sounds = {
      '합주' : imports[8],
      '낙엽' : imports[9],
      '새소리' : imports[10],
      '물장구' : imports[11],
      '이름들' : imports[12],
      '물방울' : imports[13],
      '사람들' : imports[14],
      '나무리듬' : imports[15],
      '바람개비' : imports[16],
      '일이삼사' : imports[17],
      '뻐꾸기웃음' : imports[18],
      '모래던지기' : imports[19],
      '귀요미물소리' : imports[20],
      '하모니카와멜로디온' : imports[21],
    };
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_players = {
      '합주': [],
      '낙엽': [],
      '새소리': [],
      '물장구': [],
      '이름들': [],
      '물방울': [],
      '사람들': [],
      '나무리듬': [],
      '바람개비': [],
      '일이삼사': [],
      '뻐꾸기웃음': [],
      '모래던지기': [],
      '귀요미물소리': [],
      '하모니카와멜로디온': [],
    };
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_playcounts = {
      '합주': 0,
      '낙엽': 0,
      '새소리': 0,
      '물장구': 0,
      '이름들': 0,
      '물방울': 0,
      '사람들': 0,
      '나무리듬': 0,
      '바람개비': 0,
      '일이삼사': 0,
      '뻐꾸기웃음': 0,
      '모래던지기': 0,
      '귀요미물소리': 0,
      '하모니카와멜로디온': 0,
    };

    //screen changer
    var nscreen = 3;
    var screens = [];
    var screen_names = {};
    screen_names['start'] = 1;
    screen_names['check'] = 2;
    screen_names['beach'] = 3;
    var curscreen;
    for (var idx = 0; idx < nscreen; idx++) {
      screens.push(new Layer());
    }

    function changeScreen(page) {
      //pagination buttons
      aprev._activate();
      anext._activate();
      //
      if (page < 1) page = 1;
      if (page > nscreen) page = nscreen;
      curscreen = page;
      for (var idx = 0; idx < nscreen; idx++) {
        //
        if (idx == page - 1) {
          screens[idx].bringToFront();
          top.bringToFront();
          $('.objstring').eq(idx).css('z-index', 1);
          //
          screens[idx].activate();
        } else {
          screens[idx].sendToBack();
          $('.objstring').eq(idx).css('z-index', -1);
        }
      }
      //pagination buttons
      if (curscreen == 1) {
        aprev._deactivate();
      }
      if (curscreen == nscreen) {
        anext._deactivate();
      }
    }

    function nextScreen() {
      if (curscreen + 1 <= nscreen) {
        curscreen++;
        changeScreen(curscreen);
      }
    }

    function prevScreen() {
      if (curscreen - 1 > 0) {
        curscreen--;
        changeScreen(curscreen);
      }
    }

    function changeScreenByName(pagename) {
      changeScreen(screen_names[pagename]);
    }

    function getScreenNameNext() {
      if (curscreen + 1 <= nscreen) {
        return Object.keys(screen_names)[curscreen + 1 - 1];
      } else {
        return Object.keys(screen_names)[curscreen - 1];
      }
    }

    function getScreenNamePrev() {
      if (curscreen - 1 > 0) {
        return Object.keys(screen_names)[curscreen - 1 - 1];
      } else {
        return Object.keys(screen_names)[curscreen - 1];
      }
    }

    //top layer
    var top = new Layer(); // new Layer() will be automatically activated at the moment.

    //networking - socket.io
    //var socket = io('http://192.168.42.20:8080');
    var socket = io('http://choir.run:8080');

    //net. connection marker
    var netstat = new Path.Circle({
      center: view.bounds.topRight + [-vssw / 2, +vssw / 2],
      radius: vssw / 4,
      fillColor: 'hotpink',
      strokeWidth: 2,
      strokeColor: 'gray',
      dashArray: [4, 4],
      onFrame: function(event) {
        this.rotate(1);
      }
    });
    netstat.fillColor.alpha = 0;

    //
    socket.on('connect', function() {
      console.log("i' m connected!");
      top.activate();
      netstat.fillColor.alpha = 1;
      socket.on('disconnect', function() {
        console.log("i' m disconnected!");
        top.activate();
        netstat.fillColor.alpha = 0;
      });
    });

    //page change - prev. page
    aprev.addTo(project);
    aprev.scale(vssw * 1.5);
    aprev.position = [0, 0]; //reset position, before relative positioning !!
    aprev.translate([vssw, vssw * 1.8]);
    aprev.fillColor = 'pink';
    aprev._socket = socket;
    aprev._isactive = false;
    aprev._activate = function() {
      this._isactive = true;
      this.opacity = 1;
    }
    aprev._deactivate = function() {
      this._isactive = false;
      this.opacity = 0.3;
    }
    aprev.onClick = function() {
      if (this._isactive == true) {
        prevScreen();
      }
    };

    //page change - next. page
    anext.addTo(project);
    anext.scale(vssw * 1.5);
    anext.position = [0, 0]; //reset position, before relative positioning !!
    anext.translate([vssw * 9, vssw * 1.8]);
    anext.fillColor = 'pink';
    anext._socket = socket;
    anext._isactive = false;
    anext._activate = function() {
      this._isactive = true;
      this.opacity = 1;
    }
    anext._deactivate = function() {
      this._isactive = false;
      this.opacity = 0.3;
    }
    anext.onClick = function() {
      if (this._isactive == true) {
        nextScreen();
      }
    };

    //title background
    new Path.Rectangle({
      point: [vssw * 2, vssw * 1],
      size: [vssw * 6, vssw * 1.5],
      fillColor: 'white',
      radius: 30,
    }).opacity = 0.3;

    //screen #1 - 'home'
    changeScreen(1);
    new Path.Rectangle([0, 0], vs).fillColor = '#999';

    //hello, screen.
    phonehand.addTo(project);
    phonehand.scale(vsw / 1.5);
    phonehand.position = view.center;
    //phonehand.position.y -= vssh;

    //screen #2 - check
    changeScreen(2);
    new Path.Rectangle([0, 0], vs).fillColor = '#393';

    //TODO: info text.
    new PointText({
      content: "네트워크 테스트!",
      point: view.center + [-vssw * 3, -vssw * 2],
      fontWeight: 'bold',
      fontSize: '2em',
      fillColor: 'gold'
    });
    new PointText({
      content: "사운드 테스트!",
      point: view.center + [-vssw * 3, vssw * 0],
      fontWeight: 'bold',
      fontSize: '2em',
      fillColor: 'pink'
    });
    new PointText({
      content: "동그라미 터치!",
      point: view.center + [-vssw * 3, vssw * 2],
      fontWeight: 'bold',
      fontSize: '2em',
      fillColor: 'red'
    });
    new Path.Circle({
      center: view.center,
      radius: vsw / 4,
      fillColor: 'white',
      opacity: 0.5,
      onClick: function() {
        clap.play();
      }
    });

    //screen #3 - beach page #1
    changeScreen(3);
    new Path.Rectangle([0, 0], vs).fillColor = '#333';

    iconsound.addTo(project);
    //iconsound.scale(vsw / 1.5);
    iconsound.scale(vsw / 2.5);
    iconsound.position = view.center;
    iconsound.fillColor = '#00acfe';

    new Group({
      children: [
        new Path.Circle({
          center: view.center,
          radius: vssw * 3,
          fillColor: '#fef1b5', // buttermilk
          opacity: 0.6
        })
      ],
      onClick: function() {
        clap.play();
      }
    }).addChild(iconsound);

    //play mode
    Object.keys(beach_sounds).forEach(function (key) {
      //
      beach_sounds[key].loop = true;
      beach_sounds[key].retrigger = true;

      //socket io event handling..
      // var that = this;
      socket.on('sound', function(msg) {
        if (msg.group == 'beach' && msg.name == key) {
          if (msg.action == 'start') {
            beach_players[key].push(beach_sounds[key].start()._source); // start playbacks and collect their '_source's..
            beach_playcounts[key]++;
          } else if (msg.action == 'stop') {
            if (beach_players[key].length > 0) {
              (beach_players[key].shift()).stop();
              beach_playcounts[key]--;
            }
          } else if (msg.action == 'faster') {
            if (beach_players[key].length > 0) {
              beach_players[key][beach_players[key].length - 1].playbackRate.value += 0.2;
            }
          } else if (msg.action == 'slower') {
            if (beach_players[key].length > 0) {
              beach_players[key][beach_players[key].length - 1].playbackRate.value -= 0.2;
            }
          }
        }
      });
    });

    //home
    changeScreen(1);

    //reveal the curtain.
    $('#page-loading').css('z-index', -1);

    //network event handlers

    //event: 'sound'
    socket.on('sound', function(sound) {
      if (sound.name == 'clap') {
        if (sound.action == 'start') {
          clap.start();
        }
      }
    });

  });

});
