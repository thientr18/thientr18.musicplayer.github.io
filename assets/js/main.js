
/*
1. Render songs => OK
2. Scroll top => OK
3. Play / pause / seek => OK
4. CD rotate => OK
5. Next / prev => OK
6. Random => OK
7. Next / Repeat when ended => OK
8. Active song => OK
9. Scroll active song into view
10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const progress = $('#progress')
const playlist = $('.playlist')

const playBtn = $('.btn-toggle-play')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const forwardBtn = $('.btn-forward')
const backwardBtn = $('.btn-backward')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeated: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: 'Love Story',
            singer: 'Indila',
            thumb: 'assets/img/music1.jpg',
            path: 'assets/music/music1.mp3'
        },
        {
            name: 'Suzume',
            singer: 'Toaka',
            thumb: 'assets/img/music2.jpg',
            path: 'assets/music/music2.mp3'
        },
        {
            name: '真夜中のドア/Stay With Me',
            singer: 'Miki Matsubara',
            thumb: 'assets/img/music3.jpg',
            path: 'assets/music/music3.mp3'
        },
        {
            name: '"Starry Starry Night" from Loving Vincent',
            singer: 'Lianne La Havas',
            thumb: 'assets/img/music4.jpg',
            path: 'assets/music/music4.mp3'
        },
        {
            name: 'Ghost In A Flower',
            singer: 'Yorushika',
            thumb: 'assets/img/music5.jpg',
            path: 'assets/music/music5.mp3'
        },
        {
            name: 'Tabun',
            singer: 'YOASOBI',
            thumb: 'assets/img/music6.png',
            path: 'assets/music/music6.mp3'
        },
        {
            name: 'One Voice',
            singer: 'Rokudenashi',
            thumb: 'assets/img/music7.png',
            path: 'assets/music/music7.mp3'
        },
        {
            name: 'Yoru ni Kakeku',
            singer: 'YOASOBI',
            thumb: 'assets/img/music8.png',
            path: 'assets/music/music8.mp3'
        },
        {
            name: 'Halzion',
            singer: 'YOASOBI',
            thumb: 'assets/img/music9.jpg',
            path: 'assets/music/music9.mp3'
        },
        {
            name: 'L\'Amour, Les Baguettes, Paris',
            singer: 'Stella Jang',
            thumb: 'assets/img/music10.jpg',
            path: 'assets/music/music10.mp3'
        }
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song${index === this.currentIndex ? ' active' : ''}" data-index="${index}">
                    <div class="thumb"  style="background-image: url('${song.thumb}');
                                        background-repeat: no-repeat;
                                        background-position: center;">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth

        // Handle CD Zoom
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop

            cd.style.width = newWidth > 0 ? `${newWidth}px` : 0
            cd.style.opacity = newWidth > 0 ? newWidth / cdWidth : 0
        };

        // Play / Pause song
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Handle CD Rotate events
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity 
        });
        cdThumbAnimate.pause()

        // When the song is played
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // When the song is paused
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // When the current playback position has changed
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercentage = audio.currentTime / audio.duration * 1000
                progress.value = progressPercentage
            }
        }

        // Playing Slider
        progress.oninput = function() {
            const seekTime = (progress.value * audio.duration) / 1000 
            audio.currentTime = seekTime
        }

        // Next / prev song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.handleActiveSong()
            _this.scrollToActiveSong()
        }
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.handleActiveSong()
            _this.scrollToActiveSong()
        }

        // Random song ON / OFF
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active')
        }

        //Next / Repeat when ended
        repeatBtn.onclick = function() {
            _this.isRepeated = !_this.isRepeated
            _this.setConfig('isRepeated', _this.isRepeated)
            repeatBtn.classList.toggle('active')
        }
        audio.onended = function() {
            if (_this.isRepeated) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Listen click events for 'playlist'
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')
            // Handle when clicking to song
            if (songNode || optionNode) {
                if (songNode && !optionNode) {
                    _this.currentIndex = songNode.dataset.index // dataset.index = 
                    _this.loadCurrentSong()
                    audio.play()
                    _this.handleActiveSong()
                    _this.scrollToActiveSong()
                }
                if (!songNode && optionNode) {
                    
                }
            }
        }

        // Forward / Backward events
        forwardBtn.onclick = function() {
            const seekTime = audio.currentTime + 5
            audio.currentTime = seekTime < audio.duration ? seekTime : audio.duration
        }

        backwardBtn.onclick = function() {
            const seekTime = audio.currentTime - 5
            audio.currentTime = seekTime > 0 ? seekTime : 0
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.thumb}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeated = this.config.isRepeated
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center"});
        }, 250)
    },
    handleActiveSong: function() {
        $('.song.active').classList.remove('active')
        const playlist = $$('.song');
        playlist[this.currentIndex].classList.add('active');
    },
    start: function() {
        // Load configurations from config to Object App
        this.loadConfig()

        // Define properties for Objects
        this.defineProperties()

        //  Listen / Handle to DOM events
        this.handleEvents();

        // Load current song to UI when run the application
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của repeat and ramdom buttons
        randomBtn.classList.toggle('active')
        repeatBtn.classList.toggle('active')
    }
}

app.start()