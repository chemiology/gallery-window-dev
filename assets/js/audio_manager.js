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

        musicGain.gain.value = audioVolume;

        audio.volume = Math.min(audioVolume, 1);
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

            narration.volume =
                Math.min(narrationVolume,1);

            narrationGain.gain.value =
                narrationVolume;

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

                            audio.volume = Math.min(audioVolume, 1);

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

                audio.volume = Math.min(audioVolume, 1);

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

        audio.volume = Math.min(audioVolume, 1);

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

    function setMusicVolume(v){

        audioVolume =
            Math.max(0,Math.min(2,v));

        if(audio){
            if(musicGain){

                musicGain.gain.value = audioVolume;

            }else if(audio){

                audio.volume =
                    Math.min(audioVolume,1);

            }
        }

    }

    function setNarrationVolume(v){

        narrationVolume =
            Math.max(0,Math.min(2,v));

        if(narration){
            if(narrationGain){

                narrationGain.gain.value =
                    narrationVolume;

            }else if(narration){

                narration.volume =
                    Math.min(
                        narrationVolume,
                        1
                    );

            }
        }
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
    }

    function unmute(){

        if(audio){
            audio.muted = false;
        }

        if(narration){
            narration.muted = false;
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

        musicSource = null;
        musicGain = null;

        narrationSource = null;
        narrationGain = null;

    }

    return{

        setupAudio,

        playMusic,

        pauseMusic,

        resumeMusic,

        playNarration,

        stopNarration,

        hasNarration,

        isNarrationPlaying,

        setMusicVolume,

        setNarrationVolume,

        mute,

        unmute,

        destroy

    };

})();