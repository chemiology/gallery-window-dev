/* =====================================================
   Gallery Window Audio Manager
   v1.0
===================================================== */

window.AudioManager = (()=>{

    let audio = null;
    let narration = null;

    let audioVolume = 0.5;
    let narrationVolume = 1.0;

    let fadeDuration = 500;

    /* Artwork Narration */

    let artworkNarration = null;
    let artworkNarrationSource = null;
    let artworkNarrationGain = null;

    let artworkNarrationVolume = 1.0;

    /* Web Audio */

    let audioContext = null;

    let musicSource = null;
    let narrationSource = null;

    let musicGain = null;
    let narrationGain = null;

    

    /* --------------------------------------------------
       Setup
    -------------------------------------------------- */

    async function setupAudio(

        src,
        narrationSrc,
        volume,
        curationVolume = 1.0,
        onNarrationEnd = null,
        fade = 500

    ){

        fadeDuration = fade;

        destroy();

        audio = new Audio(src);

        if(!audioContext){

            audioContext =
                new (window.AudioContext ||
                     window.webkitAudioContext)();

        }

        musicSource =
            audioContext.createMediaElementSource(audio);

        musicGain =
            audioContext.createGain();

        musicSource.connect(musicGain);

        musicGain.connect(audioContext.destination);

        audio.loop = true;

        const safeVolume =
            typeof volume==="number" && isFinite(volume)
            ? Math.max(0,Math.min(2,volume))
            :0.5;

        audioVolume = safeVolume;

        applyMusicVolume();

        audio.preload = "auto";
        audio.muted = true;

        let narrationExists = false;

        try{

            const res = await fetch(

                narrationSrc,

                {
                    method:"HEAD",
                    cache:"no-cache"
                }

            );

            narrationExists = res.ok;

        }catch{

            narrationExists = false;

        }

        if(narrationExists){

            narration = new Audio(narrationSrc);

            narrationSource =
                audioContext.createMediaElementSource(
                    narration
                );

            narrationGain =
               audioContext.createGain();

            narrationSource.connect(narrationGain);

            narrationGain.connect(audioContext.destination);

            narration.preload = "auto";

            narrationVolume =
                typeof curationVolume==="number"
                ? Math.max(0,Math.min(2,curationVolume))
                :1.0;

            applyNarrationVolume();

        }else{

            narration = null;

        }

        document.addEventListener(

            "click",

            async()=>{

                if(narration){

                    try{

                        const notice =
                            document.getElementById(
                                "curationNotice"
                            );

                        notice?.classList.add("show");

                        setTimeout(()=>{

                            notice?.classList.remove("show");

                        },3500);

                        fadeMusic(audioVolume*0.2);

                        await narration.play().catch(err=>{
                              throw err;
                        });

                        narration.onended = ()=>{

                            audio.muted = false;

                            applyMusicVolume();

                            audio.play().catch(err=>{
                                  console.warn("Music play:", err);
                            });

                            fadeMusic(audioVolume);

                            if(onNarrationEnd){

                                onNarrationEnd();

                            }

                        };

                        return;

                    }catch(err){

                        console.log("큐레이터 음성 없음");

                    }

                }

                audio.muted = false;

                applyMusicVolume();

                fadeMusic(audioVolume);

                audio.play().catch(err=>{
                      console.warn("Music play:", err);
                });

                if(onNarrationEnd){
                    onNarrationEnd();
                }

            },

            {once:true}

        );

    }

    /* --------------------------------------------------
       Music
    -------------------------------------------------- */

    function playMusic(){

        if(!audio) return;

        audio.muted = false;

        applyMusicVolume();

        audio.play().catch(err=>{
              console.warn("Music play:", err);
        });

    }

    function pauseMusic(){

        if(audio){

            audio.pause();

        }

    }

    function resumeMusic(){

        playMusic();

    }

    /* --------------------------------------------------
       Narration
    -------------------------------------------------- */

    async function playNarration(){

        if(!narration) return;

        narration.currentTime = 0;

        await narration.play().catch(err=>{
              throw err;
        });

    }

    /* --------------------------------------------------
    Artwork Narration
    -------------------------------------------------- */

    async function playArtworkNarration(src, onEnded = null){

        stopArtworkNarration();

        if(!src) return false;

        if(!audioContext){
            return false;
        }

        try{

            artworkNarration = new Audio(src);

            artworkNarration.preload = "auto";

            artworkNarrationSource =
                audioContext.createMediaElementSource(
                    artworkNarration
                );

            artworkNarrationGain =
                audioContext.createGain();

            artworkNarrationSource.connect(
                artworkNarrationGain
            );

            artworkNarrationGain.connect(
                audioContext.destination
            );

            applyArtworkNarrationVolume();

            artworkNarration.onended = ()=>{

                if(onEnded){
                    onEnded();
                }

            };

            await artworkNarration.play();

            return true;

        }catch(err){

            console.warn(
                "Artwork narration unavailable:",
                src
            );

            stopArtworkNarration();

            return false;
        }
    }


    function stopArtworkNarration(){

        if(!artworkNarration) return;

        artworkNarration.pause();

        artworkNarration.currentTime = 0;

        artworkNarration.src = "";

        artworkNarration.load();

        artworkNarration = null;

        artworkNarrationSource = null;
        artworkNarrationGain = null;
    }


    function hasArtworkNarration(){

        return artworkNarration !== null;

    }


    function isArtworkNarrationPlaying(){

        return artworkNarration
            ? !artworkNarration.paused
            : false;

    }

    function stopNarration(){

        if(!narration) return;

        narration.pause();

        narration.currentTime = 0;

    }

    function hasNarration(){
        return narration !== null;
    }

    function isNarrationPlaying(){
        return narration
            ? !narration.paused
            : false;
    }

    /* --------------------------------------------------
       Volume
    -------------------------------------------------- */

    function applyMusicVolume(){

        if(audio){

            // HTML Audio는 최대 1.0
            audio.volume = Math.min(audioVolume, 1);
        }

        if(musicGain){

            // GainNode는 2.0까지 허용
            musicGain.gain.value = audioVolume;
        }

    }

    function applyNarrationVolume(){

        if(narration){
            narration.volume = Math.min(narrationVolume, 1);
        }

        if(narrationGain){
            narrationGain.gain.value = narrationVolume;
        }
    }

    function applyArtworkNarrationVolume(){

        if(artworkNarration){

            artworkNarration.volume =
                Math.min(
                    artworkNarrationVolume,
                    1
                );

        }

        if(artworkNarrationGain){

            artworkNarrationGain.gain.value =
                artworkNarrationVolume;

        }

    }


    function setArtworkNarrationVolume(v){

        artworkNarrationVolume =
            Math.max(
                0,
                Math.min(2, v)
            );

        applyArtworkNarrationVolume();

    }

    function setMusicVolume(v){

        audioVolume =
            Math.max(0,Math.min(2,v));

        applyMusicVolume();

    }

    function setNarrationVolume(v){

        narrationVolume =
            Math.max(0,Math.min(2,v));

        applyNarrationVolume();
    }

    /* --------------------------------------------------
       Mute
    -------------------------------------------------- */

    function mute(){

        if(audio){
            audio.muted = true;
        }

        if(narration){
            narration.muted = true;
        }

        if(artworkNarration){
            artworkNarration.muted = true;
        }
    }

    function unmute(){

        if(audio){
            audio.muted = false;
        }

        if(narration){
            narration.muted = false;
        }

        if(artworkNarration){
            artworkNarration.muted = false;
        }
    }

    /* --------------------------------------------------
       fade 함수
    -------------------------------------------------- */

    function fadeMusic(target){

        if(!musicGain) return;

        musicGain.gain.cancelScheduledValues(
            audioContext.currentTime
        );

        musicGain.gain.setValueAtTime(

            musicGain.gain.value,

            audioContext.currentTime

        );

        musicGain.gain.linearRampToValueAtTime(

            target,

            audioContext.currentTime
            + fadeDuration/1000

        );

    }    

    /* --------------------------------------------------
       Destroy
    -------------------------------------------------- */

    function destroy(){

        if(audio){

            audio.pause();
            audio.src="";
            audio.load();
            audio=null;
        }

        if(narration){

            narration.pause();
            narration.src="";
            narration.load();
            narration=null;
        }

        if(artworkNarration){

            artworkNarration.pause();
            artworkNarration.src="";
            artworkNarration.load();
            artworkNarration=null;
        }

        musicSource = null;
        musicGain = null;

        narrationSource = null;
        narrationGain = null;

        artworkNarrationSource = null;
        artworkNarrationGain = null;

    }

    return{

        setupAudio,

        playMusic,

        pauseMusic,

        resumeMusic,

        /* Curation */
        playNarration,
        stopNarration,
        hasNarration,
        isNarrationPlaying,

        /* Artwork Narration */
        playArtworkNarration,
        stopArtworkNarration,
        hasArtworkNarration,
        isArtworkNarrationPlaying,

        setMusicVolume,
        setNarrationVolume,
        setArtworkNarrationVolume,

        mute,
        unmute,

        destroy
    };

})();