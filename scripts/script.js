const Diagnostics = require('Diagnostics');
const FaceTracking = require('FaceTracking');
// @ts-ignore
const Scene = require('Scene');
const Reactive = require('Reactive');
const Materials = require('Materials');
const TouchGestures = require('TouchGestures');
const Random = require('Random');
const Shaders = require('Shaders');
const Textures = require('Textures');
const Patches = require('Patches');
const Time = require('Time');
const Instruction = require('Instruction');
// @ts-ignore
const Animation = require('Animation');
const CameraInfo = require('CameraInfo');
const Persistence = require('Persistence');
const NativeUI = require('NativeUI');

// @ts-ignore
NativeUI.slider.visible = true;
// @ts-ignore
NativeUI.slider.value = 1;

let tapYourEyesInstruction = true;
let touchHoldInstruction = true;
let tapToChangeInstruction = true;

const root = Scene.root;

const WHITE = 1;
const DARK = -1;
const RANDOM = 0;

let instructionTimer;
(async function() {
    /*
    *   Getting textures
    */
    /* Balaclava main colors */
    let balaclavaTexture = (await Textures.findFirst('balaclavaTexture')).signal;
    let balaclavaAOTexture = (await Textures.findFirst('Texture 0')).signal;
    /* Labels on balaclava */
    let label1Texture = (await Textures.findFirst('label')).signal;
    let label2Texture = (await Textures.findFirst('label2')).signal;
    let label3Texture = (await Textures.findFirst('label3')).signal;
    let label4Texture = (await Textures.findFirst('label4')).signal;
    let label5Texture = (await Textures.findFirst('label5')).signal;
    let label6Texture = (await Textures.findFirst('label6')).signal;
    let label7Texture = (await Textures.findFirst('label7')).signal;
    let label8Texture = (await Textures.findFirst('label8')).signal;
    let label9Texture = (await Textures.findFirst('label9')).signal;
    let label11Texture = (await Textures.findFirst('label11')).signal;
    let label14Texture = (await Textures.findFirst('label14')).signal;
    let label15Texture = (await Textures.findFirst('label15')).signal;
    let label17Texture = (await Textures.findFirst('label17')).signal;
    let label18Texture = (await Textures.findFirst('label18')).signal;
    let label19Texture = (await Textures.findFirst('label19')).signal;
    let label21Texture = (await Textures.findFirst('label21')).signal;
    let label22Texture = (await Textures.findFirst('label22')).signal;
    /* Utility textures for background */
    let cameraTexture = (await Textures.findFirst('cameraTexture0')).signal;
    let shadowsTexture = (await Textures.findFirst('Texture 2')).signal;
    let tilesTexture = (await Textures.findFirst('tiles')).signal;

    let glassTexture = cameraTexture;

    let SHOW_INSTRUCTIONS = true;
    /* Generating labels from textures 
    * {main — Main texture, alt — Alternative color if generated balaclava color is dark}
    */
    const labels = [
        {
            main: label1Texture
        },
        {
            main: label2Texture
        },
        {
            main: blendImages([label2Texture, label6Texture])
        },
        {
            main: label3Texture
        },
        {
            main: blendImages([label3Texture, label11Texture, label8Texture])
        },
        {
            main: blendImages([label3Texture, label6Texture, label17Texture])
        },
        {
            main: label4Texture,
        },
        {
            main: blendImages([label4Texture, label7Texture])
        },
        {
            main: label5Texture
        },
        {
            main: blendImages([label5Texture, label7Texture])
        },
        {
            main: label6Texture,
        },
        {
            main: blendImages([label6Texture, label11Texture])
        },
        {
            main: label7Texture
        },
        {
            main: blendImages([label8Texture, label11Texture])
        },
        {
            main: blendImages([label9Texture, label8Texture, label11Texture])
        },
        {
            main: label14Texture
        },
        {
            main: blendImages([label14Texture, label5Texture])
        },
        {
            main: label15Texture
        },
        {
            main: label17Texture
        },
        {
            main: label18Texture,
            alt: label19Texture
        },
        {
            main: blendImages([label18Texture, label6Texture, label11Texture]),
            alt: blendImages([label19Texture, whiteLabel(blendImages([label6Texture, label11Texture]))])
        },
        {
            main: blendImages([label18Texture, label11Texture, label8Texture]),
            alt: blendImages([label19Texture, whiteLabel(blendImages([label11Texture, label8Texture]))])
        },
        {
            main: label21Texture
        },
        {
            main: label22Texture
        }
    ]

    /* Gerating color texture with AO shadows */
    let balaclavaWithAO = multiplyImages([balaclavaAOTexture, balaclavaTexture]);

    const userScope = Persistence.userScope;
    let data = { completed: false };
    function showStartInstructions() {
        Instruction.bind(SHOW_INSTRUCTIONS && tapToChangeInstruction, Reactive.val('tap_to_change'));
        instructionTimer = Time.setTimeout(() => {
            Instruction.bind(false, Reactive.val('tap_to_change'));
            tapToChangeInstruction = false;
            instructionTimer = null;
        }, 3000);
    }
    userScope.get('tutorial').then(function(result) {
        // @ts-ignore
        data = result
        SHOW_INSTRUCTIONS = !data.completed;
        showStartInstructions();
    }).catch(function(error) {
        showStartInstructions();
    });


    const WHITE_BALACLAVA_LABEL_COLOR = [
        Reactive.pack3(Reactive.val(0.0), Reactive.val(1), Reactive.val(0.5)),
        Reactive.pack3(Reactive.val(0.0), Reactive.val(1), Reactive.val(0.5)),
        Reactive.pack3(Reactive.val(0.0), Reactive.val(1), Reactive.val(0.5)),
        Reactive.pack3(Reactive.val(0), Reactive.val(0), Reactive.val(0)),
    ]

    const BLACK_BALACLAVA_LABEL_COLOR = [
        Reactive.pack3(Reactive.val(0.0), Reactive.val(1), Reactive.val(0.5)),
        Reactive.pack3(Reactive.val(0.0), Reactive.val(1), Reactive.val(0.5)),
        Reactive.pack3(Reactive.val(0.0), Reactive.val(1), Reactive.val(0.5)),
        Reactive.pack3(Reactive.val(0.25), Reactive.val(1), Reactive.val(0.5)),
    ]

    const BLACK = Reactive.pack4(Reactive.val(0), Reactive.val(0), Reactive.val(0), Reactive.val(0));

    // Balaclavas
    const balaclava1 = await root.findFirst('balaclava');
    const balaclava2 = await root.findFirst('balaclava1');
    const balaclava3 = await root.findFirst('balaclava2');
    const balaclava4 = await root.findFirst('balaclava3');
    const balaclava5 = await root.findFirst('balaclava4');

    // Balaclavas Eyes
    const eyes1 = await root.findFirst('eyes');
    const eyes2 = await root.findFirst('eyes1');
    const eyes3 = await root.findFirst('eyes2');
    const eyes4 = await root.findFirst('eyes3');
    const eyes5 = await root.findFirst('eyes4');

    const background = await root.findFirst('background');

    // Balaclavas Materials
    const balaclava1Material = await Materials.findFirst('balaclava');
    const balaclava2Material = await Materials.findFirst('balaclava1');
    const balaclava3Material = await Materials.findFirst('balaclava2');
    const balaclava4Material = await Materials.findFirst('balaclava3');
    const balaclava5Material = await Materials.findFirst('balaclava4');

    const balaclavaHoles1Material = await Materials.findFirst('balaclavaHoles');
    const balaclavaHoles2Material = await Materials.findFirst('balaclavaHoles1');
    const balaclavaHoles3Material = await Materials.findFirst('balaclavaHoles2');
    const balaclavaHoles4Material = await Materials.findFirst('balaclavaHoles3');
    const balaclavaHoles5Material = await Materials.findFirst('balaclavaHoles4');

    const backgroundMaterial = await Materials.findFirst('B&W');
    const tilesMaterial = await Materials.findFirst('tiles');
    const gradientMaterial = await Materials.findFirst('gradientMaterial');
    const gradientMaterial1 = await Materials.findFirst('gradientMaterial1');

    const main = await root.findFirst('main');

    let balaclavas = [
        {
            prefab: await balaclava1.findFirst('000-0-0'), material: balaclava1Material
        },
        {
            prefab: await balaclava2.findFirst('000-0-0'), material: balaclava2Material
        },
        {
            prefab: await balaclava3.findFirst('000-0-0'), material: balaclava3Material
        },
        {
            prefab: await balaclava4.findFirst('000-0-0'), material: balaclava4Material
        },
        {
            prefab: await balaclava5.findFirst('000-0-0'), material: balaclava5Material
        }
    ];
    
    let balaclavaEyes = [
        {
            prefab: await eyes1.findFirst('000-0-0'), material: balaclavaHoles1Material, index: 0
        },
        {
            prefab: await eyes2.findFirst('000-0-0'), material: balaclavaHoles2Material, index: 0
        },
        {
            prefab: await eyes3.findFirst('000-0-0'), material: balaclavaHoles3Material, index: 0
        },
        {
            prefab: await eyes4.findFirst('000-0-0'), material: balaclavaHoles4Material, index: 0
        },
        {
            prefab: await eyes5.findFirst('000-0-0'), material: balaclavaHoles5Material, index: 0
        }
    ];
    
    let backgroundIndex = 0;
    
    setupBalaclava(0, balaclava1);
    setupBalaclava(1, balaclava2);
    setupBalaclava(2, balaclava3);
    setupBalaclava(3, balaclava4);
    setupBalaclava(4, balaclava5);
    setupBalaclava(0, eyes1);
    setupBalaclava(1, eyes2);
    setupBalaclava(2, eyes3);
    setupBalaclava(3, eyes4);
    setupBalaclava(4, eyes5);

    main.hidden = Reactive.val(false);
    
    let darkGenerate = 0.05;
    let whiteGenerate = 0.9;
    
    for (let index = 0; index < balaclavas.length; index++) {
        const balaclava = balaclavas[index];
        balaclava.labelIndex = randomChoiceIndex(labels);
        TouchGestures.onTap(balaclava.prefab).subscribe(() => {
            if (instructionTimer) {
                Time.clearTimeout(instructionTimer);
            }
            Instruction.bind(SHOW_INSTRUCTIONS && touchHoldInstruction, Reactive.val('touch_hold'));
            touchHoldInstruction = false;
            instructionTimer = Time.setTimeout(() => {
                Instruction.bind(false, Reactive.val('touch_hold'));
                instructionTimer = null;
            }, 3000);
            const mixConfig = changeBalaclavaColor(index);
            balaclava.labelIndex = randomChoiceIndex(labels);
            if (backgroundIndex == 3 || backgroundIndex == 4) {
                // @ts-ignore
                const textureSlot = Shaders.PhysicallyBasedMaterialTextures.BASE_COLOR; 
                for (let index = 0; index < balaclavas.length; index++) {
                    balaclavas[index].material.setTextureSlot(textureSlot, generateRandomBalaclavaLabel(balaclava.labelIndex, mixConfig));
                }
            }
        })
        changeBalaclavaColor(index, index == 0, 0.6);
        TouchGestures.onLongPress(balaclava.prefab).subscribe(() => {
            balaclava.labelIndex = (balaclava.labelIndex + 1) % labels.length;
            // @ts-ignore
            const textureSlot = Shaders.PhysicallyBasedMaterialTextures.BASE_COLOR; 
            balaclava.material.setTextureSlot(textureSlot,generateRandomBalaclavaLabel(balaclava.labelIndex, balaclava.mixConfig));
            if (instructionTimer) {
                Time.clearTimeout(instructionTimer);
            }
            Instruction.bind(SHOW_INSTRUCTIONS && tapYourEyesInstruction, Reactive.val('tap_your_eyes'));
            tapYourEyesInstruction = false;
            instructionTimer = Time.setTimeout(() => {
                Instruction.bind(false, Reactive.val('tap_your_eyes'));
                instructionTimer = null;
            }, 3000);
        })
    }
    
    function changeAllBalaclavasColors(startGenerate = false, minL = 0.0) {
        if (backgroundIndex == 3 || backgroundIndex == 4) {
            const mixConfig = changeBalaclavaColor(0, startGenerate, minL);
            // @ts-ignore
            const textureSlot = Shaders.PhysicallyBasedMaterialTextures.BASE_COLOR; 
            for (let index = 0; index < balaclavas.length; index++) {
                balaclavas[index].material.setTextureSlot(textureSlot, generateRandomBalaclavaLabel(balaclavas[index].labelIndex, mixConfig));
            }
        } else {
            for (let index = 0; index < balaclavas.length; index++) {
                changeBalaclavaColor(index, startGenerate, minL);
            }
        }
    }
    
    function changeBalaclavaColor(index, startGenerate = false, minL = 0.0) {
        const balaclava = balaclavas[index];
        const generateColor = !(startGenerate && index == 0);
        let mixConfig = generateBalaclavaRandomColor(generateColor, {
            minL: minL
        }, darkGenerate, whiteGenerate);
        balaclava.mixConfig = mixConfig;
        
        // @ts-ignore
        const textureSlot = Shaders.PhysicallyBasedMaterialTextures.BASE_COLOR; 
        balaclava.material.setTextureSlot(textureSlot, generateRandomBalaclavaLabel(balaclava.labelIndex, mixConfig));
        return mixConfig;
    }
    
    const backgroundChange = await Scene.root.findFirst('backgroundChange');
    TouchGestures.onLongPress(backgroundChange).subscribe(() => {
        backgroundIndex = (backgroundIndex + 1) % 6;
        changeBackground();
        switch (backgroundIndex) {
            case 0:
                darkGenerate = 0.05;
                whiteGenerate = 0.9;
                balaclavaEyes.forEach((balaclavaEye) => {
                    if (balaclavaEye.index == 6) {
                        balaclavaEye.index = 0;
                    }
                    changeEyes(balaclavaEye, false)
                })
                break;
            case 1:
                darkGenerate = 0.5;
                whiteGenerate = 0.5;
                balaclavaEyes.forEach((balaclavaEye) => {
                    if (balaclavaEye.index == 0) {
                        balaclavaEye.index = 6;
                    }
                    changeEyes(balaclavaEye, false)
                })
                break;
            case 2:
                darkGenerate = 0.1;
                whiteGenerate = 0.9;
                balaclavaEyes.forEach((balaclavaEye) => {
                    changeEyes(balaclavaEye, false)
                })
                break;
            case 3:
                darkGenerate = 0.1;
                whiteGenerate = 0.9;
                balaclavaEyes.forEach((balaclavaEye) => {
                    if (balaclavaEye.index == 6) {
                        balaclavaEye.index = 0;
                    }
                    changeEyes(balaclavaEye, false)
                })
                break;
            case 4:
                darkGenerate = 0.1;
                whiteGenerate = 0.9;
                balaclavaEyes.forEach((balaclavaEye) => {
                    changeEyes(balaclavaEye, false)
                })
                break;
            case 5:
                darkGenerate = 0.1;
                whiteGenerate = 0.9;
                balaclavaEyes.forEach((balaclavaEye) => {
                    changeEyes(balaclavaEye, false)
                })
                break;
        }
        changeAllBalaclavasColors();
    });
    changeBackground();
    
    function changeBackground() {
        if (backgroundIndex == 2) {
            Time.setTimeout(() => {
                background.material = tilesMaterial;
            }, 100);
            
            glassTexture = tilesTexture;
        } else if (backgroundIndex == 3) {
            Time.setTimeout(() => {
                background.material = gradientMaterial;
            }, 100);
           
            glassTexture = cameraTexture;
        } else if (backgroundIndex == 4) {
            Time.setTimeout(() => {
                background.material = gradientMaterial1;
            }, 100);
           
            glassTexture = cameraTexture;
        } else {
            Time.setTimeout(() => {
                background.material = backgroundMaterial;
            }, 100);
           
            glassTexture = cameraTexture;
            // @ts-ignore
            const textureSlot = Shaders.DefaultMaterialTextures.DIFFUSE; 
            // @ts-ignore
            backgroundMaterial.setTextureSlot(textureSlot, getBackground(backgroundIndex));
        }
    }
    
    for (let index = 0; index < balaclavaEyes.length; index++) {
        const balaclavaEye = balaclavaEyes[index];
        TouchGestures.onLongPress(balaclavaEye.prefab).subscribe(() => {
            if (!tapYourEyesInstruction) {
                Instruction.bind(false, Reactive.val('tap_your_eyes'));
            }
            userScope.set('tutorial', {completed: true});
            balaclavaEye.index = (balaclavaEye.index + 1) % 7;
            changeEyes(balaclavaEye)
            
        })
        changeEyes(balaclavaEye, false)
    }
    
    function changeEyes(balaclavaEye, animate=true) {
        // @ts-ignore
        const textureSlot = Shaders.DefaultMaterialTextures.DIFFUSE; 
        let texture = getEyeTexture(balaclavaEye.index);
    
        let transitionImage;
        if (animate) {
            const timeDriverParameters = {
                durationMilliseconds: 400,
                loopCount: 1,
            };
            const timeDriver = Animation.timeDriver(timeDriverParameters);
            const quadraticSampler = Animation.samplers.easeInOutQuad(0, 1);
            let alphaAnimation = Animation.animate(timeDriver, quadraticSampler);
            // @ts-ignore
            transitionImage = blendImages([ Reactive.pack4(texture.x, texture.y, texture.z, alphaAnimation), getEyeTexture((((balaclavaEye.index - 1)%7)+7)%7)]);
            timeDriver.start()
        } else {
            transitionImage = texture;
        }
        balaclavaEye.material.setTextureSlot(textureSlot, multiplyImages([
            transitionImage, 
            // @ts-ignore
            shadowsTexture.div(Reactive.pack4(Reactive.val(1), Reactive.val(1), Reactive.val(1), Reactive.val(2.4)))
        ]));
        balaclavaEye.prev = transitionImage;
    }
    
    function getEyeTexture(index) {
        switch (index) {
            case 0:   
                return extractFace(cameraTexture);
            case 1:
                return glassPro(blackAndWhite(glassTexture), 0.9, 0.3, BLACK);
            case 2:
                return glassPro(redAndBlack(glassTexture), 0.9, 0.3, Reactive.pack4(Reactive.val(0.7), Reactive.val(0), Reactive.val(0), Reactive.val(0.3)));
            case 3:
                return glassPro(blackAndWhite(glassTexture).div(Reactive.val(1.5)), 0.9, 0.3, Reactive.pack4(Reactive.val(0.3), Reactive.val(1), Reactive.val(0), Reactive.val(1)));
            case 4:
                return glassPro(blackAndWhite(glassTexture).div(Reactive.val(1.5)), 0.9, 0.3, Reactive.pack4(Reactive.val(0), Reactive.val(0), Reactive.val(1), Reactive.val(1)));
            case 5:
                return glassPro(glassTexture, 0.9, 0.3, BLACK);
            case 6:
                return extractFace(blackAndWhite(cameraTexture));
        }
    }
    
    function getBackground(index) {
        switch (index) {
            case 0:
                return blackAndWhite(cameraTexture)
            case 1: 
                return redAndBlack(cameraTexture)
            case 5:
                return cameraTexture;
        }
    }
    
    async function setupBalaclava(faceIndex, balaclava) {
        const face = FaceTracking.face(faceIndex);
        const left = await balaclava.findFirst('left');
        const right = await balaclava.findFirst('right');
        const top = await balaclava.findFirst('top');
        const bottom = await balaclava.findFirst('bottom');
        left.transform.position = face.leftCheek.cheekbone.add(Reactive.vector(Reactive.val(-0.033), Reactive.val(0.05), Reactive.val(0.03)));
        right.transform.position = face.rightCheek.cheekbone.add(Reactive.vector(Reactive.val(0.015), Reactive.val(0.055), Reactive.val(0.016)));
        top.transform.position = face.forehead.top.add(Reactive.vector(Reactive.val(0), Reactive.val(0.075), Reactive.val(0.07)));
        bottom.transform.position = face.chin.tip.add(Reactive.vector(Reactive.val(0.002), Reactive.val(0.045), Reactive.val(0.065)));
    }
    
    
    
    function generateBalaclavaRandomColor(generateColor = true, config = {}, darkRandom = 0.1, whiteRandom = 0.9) {
        let hRandom = 0;
        let sRandom = 0;
        let s1Random = 1.5;
        let lRandom = 1;
        let whiteOrDarkRandom = 0.5;
        let multiplyS = 1;
        const bConfig = {lightness: 0};
    
        // @ts-ignore
        const randomColorV = Reactive.vector(325 / 360, 61 / 100, 91 / 100);
    
        if (generateColor) {
            whiteOrDarkRandom = Random.random();
            hRandom = Random.random() * 100;
            sRandom = Math.max(0, Random.random() * 1.5 - 0.5);
            lRandom = 0.4 + Random.random() * 1;
            if (config.minL && config.minL > lRandom) {
                lRandom = config.minL;
            }
    
            s1Random = Random.random() * 1;
        }
    
        if (whiteOrDarkRandom < darkRandom) {
            lRandom = 0;
            multiplyS = 0;
            bConfig.lightness = DARK;
        } else if (whiteOrDarkRandom > whiteRandom) {
            multiplyS = 0;
            lRandom = Math.max(1, lRandom);
            bConfig.lightness = WHITE;
        } else {
            bConfig.lightness = RANDOM;
        }
        bConfig.lRandom = lRandom;
        bConfig.h = 328 / 360 + hRandom;
    
        Patches.inputs.setVector('randomColor', randomColorV.add(Reactive.vector(hRandom, sRandom, 0)).mul(Reactive.vector(1, multiplyS, lRandom)))
    
        let balaclava1HSV = rgbToHSV(balaclavaWithAO);
    
        let randomMix;
    
        randomMix = Reactive.pack4(
            balaclava1HSV.x.add(Reactive.val(hRandom)).mod(Reactive.val(1)),
            balaclava1HSV.y.add(Reactive.val(sRandom)).mul(Reactive.val(multiplyS)),
            balaclava1HSV.z,
            Reactive.val(1)
        );
        randomMix = hsvToHSL(randomMix);
        randomMix = Reactive.pack4(
            randomMix.x,
            randomMix.y,
            randomMix.z.mul(Reactive.val(lRandom)),
            Reactive.val(1)
        );
        randomMix = hslToRGB(randomMix);
    
        if (bConfig.lightness == WHITE) {
            randomMix = blackAndWhite(randomMix);
        }
    
        bConfig.mix = randomMix;
    
        return bConfig
    }
    
    function generateRandomBalaclavaLabel(labelIndex, mixConfig) {
        let labelMix;
        let mix;
        const labelTextureConfig = labels[labelIndex];
        const labelTexture = labelTextureConfig.main;
        if (mixConfig.lightness == DARK) {
            labelMix = rgbToHSL(Reactive.pack3(labelTexture.x, labelTexture.y, labelTexture.z).sub(Reactive.val(2)).abs());
            labelMix = Reactive.pack2(randomChoice(BLACK_BALACLAVA_LABEL_COLOR), labelTexture.w.mul(NativeUI.slider.value));
            labelMix = hslToRGB(labelMix)
            mix = blendImages([labelMix, mixConfig.mix])
        } else if (mixConfig.lightness == WHITE) {
            // @ts-ignore
            labelMix = rgbToHSL(Reactive.pack3(labelTexture.x, labelTexture.y, labelTexture.z).sub(2).abs());
            // @ts-ignore
            labelMix = Reactive.pack2(randomChoice(WHITE_BALACLAVA_LABEL_COLOR), labelTexture.w.mul(NativeUI.slider.value));
            labelMix = hslToRGB(labelMix)
            mix = blendImages([labelMix, mixConfig.mix])
        } else {
            // Add label
            if (mixConfig.lRandom < 0.75) {
                if (labelTextureConfig.alt) {
                    labelMix = labelTextureConfig.alt;
                } else {
                    labelMix = invertColor(labelTexture);
                }
                labelMix = labelMix.mul(Reactive.pack4(Reactive.val(1), Reactive.val(1), Reactive.val(1), NativeUI.slider.value))
                mix = blendImages([labelMix, mixConfig.mix])
            } else {
                labelMix = labelTexture;
                labelMix = labelMix.mul(Reactive.pack4(Reactive.val(1), Reactive.val(1), Reactive.val(1), NativeUI.slider.value))
                mix = blendImages([labelMix, mixConfig.mix])
            }
        }
        return mix;
    }
    
    function invertColor(labelTexture) {
        return Reactive.pack2(Reactive.pack3(labelTexture.x, labelTexture.y, labelTexture.z).sub(Reactive.val(2)).abs(), labelTexture.w.div(Reactive.val(1.8)));
    }
    
    function redLabel(labelTexture) {
        return Reactive.pack2(Reactive.pack3(Reactive.val(1), Reactive.val(0), Reactive.val(0)), labelTexture.w);
    }
    
    function whiteLabel(labelTexture) {
        return Reactive.pack2(Reactive.pack3(Reactive.val(1), Reactive.val(1), Reactive.val(1)), labelTexture.w.div(1));
    }
    
    function isUndefined(value) {
        return typeof value === "undefined";
    }
    
    function rgbToHSL(s) {
        return Shaders.colorSpaceConvert(s, {
            // @ts-ignore
            inColorSpace: Shaders.ColorSpace.RGB,
            // @ts-ignore
            outColorSpace: Shaders.ColorSpace.HSL
        });
    }
    
    function rgbToHSV(s) {
        return Shaders.colorSpaceConvert(s, {
            // @ts-ignore
            inColorSpace: Shaders.ColorSpace.RGB,
            // @ts-ignore
            outColorSpace: Shaders.ColorSpace.HSV
        });
    }
    
    function hsvToHSL(s) {
        return Shaders.colorSpaceConvert(s, {
            // @ts-ignore
            inColorSpace: Shaders.ColorSpace.HSV,
            // @ts-ignore
            outColorSpace: Shaders.ColorSpace.HSL
        });
    }
    
    function hslToRGB(s) {
        return Shaders.colorSpaceConvert(s, {
            // @ts-ignore
            inColorSpace: Shaders.ColorSpace.HSL,
            // @ts-ignore
            outColorSpace: Shaders.ColorSpace.RGB
        });
    }
    
    function randomChoice(array) {
        return array[Math.floor(Random.random() * array.length)]
    }
    
    function randomChoiceIndex(array) {
        return Math.floor(Random.random() * array.length)
    }
    
    function blendImages(array) {
        let mix = array[0];
        for (let index = 1; index < array.length; index++) {
            const element = array[index];
            mix = Shaders.blend(mix, element, {
                mode: Shaders.BlendMode.NORMAL
            })
        }
        return mix;
    }
    
    function multiplyImages(array) {
        let mix = array[0];
        for (let index = 1; index < array.length; index++) {
            const element = array[index];
            mix = Shaders.blend(mix, element, {
                // @ts-ignore
                mode: Shaders.BlendMode.MULTIPLY
            })
        }
        return mix;
    }
    
    function glassPro(texture, distortion, disperssion, tint) {
        const normals = Reactive.dot(
            Reactive.normalize(Shaders.fragmentStage(
                // @ts-ignore
                Shaders.vertexTransform({variableName: Shaders.BuiltinUniform.NORMAL_MATRIX}).mul(Shaders.vertexAttribute({variableName: Shaders.VertexAttribute.NORMAL}))
            )),
            Reactive.vector(Reactive.val(0), Reactive.val(0), Reactive.val(-1))
        ).add(Reactive.val(1)).pow(Reactive.val(0.7));
        // @ts-ignore
        let positionMul = Shaders.vertexTransform({variableName: Shaders.BuiltinUniform.MVP_MATRIX}).mul(Shaders.vertexAttribute({variableName: Shaders.VertexAttribute.POSITION}))
        positionMul = Reactive.pack3(positionMul.x, positionMul.y, positionMul.z).div(positionMul.w).mul(Reactive.val(0.5)).add(Reactive.val(0.5));
        positionMul = Reactive.pack2(positionMul.x, Reactive.toRange(positionMul.y, Reactive.val(1), Reactive.val(0))).add(Reactive.val(distortion).mul(normals));
        const textureY = Shaders.textureSampler(
            texture,
            // @ts-ignore
            positionMul
        );
        const textureX = Shaders.textureSampler(
            texture,
            // @ts-ignore
            positionMul.add(Reactive.toRange(Reactive.val(disperssion), Reactive.val(0), Reactive.val(0.1)).mul(normals))
        );
        const textureZ = Shaders.textureSampler(
            texture,
            // @ts-ignore
            positionMul.sub(Reactive.toRange(Reactive.val(disperssion), Reactive.val(0), Reactive.val(0.1)).mul(normals))
        );
        // @ts-ignore
        const outputTexture = Reactive.pack4(textureX.x, textureY.y, textureZ.z, Reactive.val(1));
        return outputTexture.add(Reactive.pack4(normals, normals, normals, Reactive.val(1)).mul(tint));
    }
    
    function extractFace(texture) {
        // @ts-ignore
        let positionMul = Shaders.vertexTransform({variableName: Shaders.BuiltinUniform.MVP_MATRIX}).mul(Shaders.vertexAttribute({variableName: Shaders.VertexAttribute.POSITION}))
        positionMul = Reactive.pack3(positionMul.x, positionMul.y, positionMul.z).div(positionMul.w).mul(Reactive.val(0.5)).add(Reactive.val(0.5));
        positionMul = Reactive.pack2(positionMul.x, Reactive.toRange(positionMul.y, Reactive.val(1), Reactive.val(0)));
        return Shaders.textureSampler(
            texture,
            // @ts-ignore
            positionMul
        );
    }
    
    function blackAndWhite(texture) {
        const bw = texture.x.add(texture.y).add(texture.z).div(Reactive.val(3));
        return Reactive.pack4(bw, bw, bw, Reactive.val(1));
    }
    
    function redAndBlack(texture) {
        return Reactive.pack4(texture.x.div(Reactive.val(2)), Reactive.val(0), Reactive.val(0), Reactive.val(1));
    }
    
    function greenAndBlack(texture) {
        return Reactive.pack4(Reactive.val(0), texture.y.div(Reactive.val(2)), Reactive.val(0), Reactive.val(1));
    }
    
    function blueAndBlack(texture) {
        return Reactive.pack4(Reactive.val(0), Reactive.val(0), texture.z.div(Reactive.val(2)), Reactive.val(1));
    }
    
    
    
    CameraInfo.isRecordingVideo.monitor({fireOnInitialValue: true}).subscribe((event) => {
        if (event.newValue) {
            Instruction.bind(false, Reactive.val('tap_to_change'));
            SHOW_INSTRUCTIONS = false;
        }
    })
})();