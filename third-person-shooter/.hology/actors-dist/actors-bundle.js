/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
var actors;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../../hology-examples/third-person-shooter/src/actors/ball-actor.ts":
/*!******************************************************************************!*\
  !*** ../../../hology-examples/third-person-shooter/src/actors/ball-actor.ts ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _hology_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hology/core */ \"@hology/core\");\n/* harmony import */ var _hology_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_hology_core__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @hology/core/gameplay */ \"@hology/core/gameplay\");\n/* harmony import */ var _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @hology/core/gameplay/actors */ \"@hology/core/gameplay/actors\");\n/* harmony import */ var _hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _hology_core_shader_parameter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @hology/core/shader/parameter */ \"@hology/core/shader/parameter\");\n/* harmony import */ var _hology_core_shader_parameter__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_hology_core_shader_parameter__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ \"rxjs\");\n/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! three */ \"three\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_5__);\nvar __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {\n    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n    if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);\n    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n    return c > 3 && r && Object.defineProperty(target, key, r), r;\n};\nvar __metadata = (undefined && undefined.__metadata) || function (k, v) {\n    if (typeof Reflect === \"object\" && typeof Reflect.metadata === \"function\") return Reflect.metadata(k, v);\n};\nvar BallActor_1;\nvar _a;\n\n\n\n\n\n\nconsole.log(\"shapemesh\", new _hology_core__WEBPACK_IMPORTED_MODULE_0__.SphereCollisionShape(5) instanceof _hology_core__WEBPACK_IMPORTED_MODULE_0__.SphereCollisionShape);\nlet BallActor = BallActor_1 = class BallActor extends _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.BaseActor {\n    constructor() {\n        super();\n        this.physicsSystem = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.inject)(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.PhysicsSystem);\n        this.radius = 0.3;\n        this.a = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.attach)(AComponent);\n        this.mesh = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.attach)(_hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_2__.MeshComponent, {\n            mass: 1,\n            bodyType: _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.PhysicsBodyType.dynamic,\n            continousCollisionDetection: true\n        });\n    }\n    onInit() {\n        // if attach is called in the on init method, then oninit will not be called on components\n        // several solutons to this\n        // - call on init twice when starting\n        // - force user to call init when attaching\n        // - use another life cycle event for setting up stuff that makes use of parameters\n        // Call on init on the actor before children to enable defining them on the on init.\n        // The downside with that is if you for some reason are relying on them to be setup before accessing them.\n        this.mesh.replaceMesh(execRandom(\n        /*() => new PhysicalShapeMesh(\n          new BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2),\n          new MeshStandardMaterial({ color: 0xeff542, roughness: .3 }),\n          new BoxCollisionShape(new Vector3(this.radius * 2, this.radius * 2, this.radius * 2))\n        ),*/\n        () => new _hology_core__WEBPACK_IMPORTED_MODULE_0__.PhysicalShapeMesh(new three__WEBPACK_IMPORTED_MODULE_5__.SphereGeometry(this.radius, 20, 10), new three__WEBPACK_IMPORTED_MODULE_5__.MeshStandardMaterial({ color: 0xeff542, roughness: .3 }), new _hology_core__WEBPACK_IMPORTED_MODULE_0__.SphereCollisionShape(this.radius))));\n        this.mesh.mesh.castShadow = true;\n        this.mesh.mesh.receiveShadow = true;\n        this.physicsSystem.onCollisionWithActorType(this, BallActor_1).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.takeUntil)(this.disposed)).subscribe(other => {\n            const material = other.mesh.mesh.material;\n            if (material instanceof three__WEBPACK_IMPORTED_MODULE_5__.MeshStandardMaterial) {\n                material.color = new three__WEBPACK_IMPORTED_MODULE_5__.Color(Math.random(), Math.random(), Math.random());\n            }\n        });\n    }\n    shoot(direction) {\n        // TODO Apply impulse on the actor\n        //this.physicsSystem.applyImpulse()\n        // TODO Need a way to remove the ball after some time.\n    }\n    moveTo(position) {\n        // TODO Make changin position with physics easier maybe\n        // Maybe for kinematic actors, always copy the transform from the actor.\n        // Also need to handle dynamic bodies. \n        this.container.position.copy(position);\n        this.physicsSystem.updateActorTransform(this);\n    }\n};\n__decorate([\n    (0,_hology_core_shader_parameter__WEBPACK_IMPORTED_MODULE_3__.Parameter)(),\n    __metadata(\"design:type\", Number)\n], BallActor.prototype, \"radius\", void 0);\n__decorate([\n    (0,_hology_core_shader_parameter__WEBPACK_IMPORTED_MODULE_3__.Parameter)(),\n    __metadata(\"design:type\", typeof (_a = typeof _hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_2__.SpawnPoint !== \"undefined\" && _hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_2__.SpawnPoint) === \"function\" ? _a : Object)\n], BallActor.prototype, \"player\", void 0);\nBallActor = BallActor_1 = __decorate([\n    (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.Actor)(),\n    __metadata(\"design:paramtypes\", [])\n], BallActor);\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BallActor);\nfunction execRandom(...fn) {\n    return fn[Math.floor(Math.random() * fn.length)]();\n}\nlet BComponent = class BComponent extends _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.ActorComponent {\n    constructor() {\n        super(...arguments);\n        this.foo = 3;\n    }\n};\nBComponent = __decorate([\n    (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.Component)()\n], BComponent);\nlet AComponent = class AComponent extends _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.ActorComponent {\n    constructor() {\n        super(...arguments);\n        this.b = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.attach)(BComponent);\n    }\n};\nAComponent = __decorate([\n    (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_1__.Component)()\n], AComponent);\n\n\n//# sourceURL=webpack://actors/../../../hology-examples/third-person-shooter/src/actors/ball-actor.ts?");

/***/ }),

/***/ "../../../hology-examples/third-person-shooter/src/actors/character-actor.ts":
/*!***********************************************************************************!*\
  !*** ../../../hology-examples/third-person-shooter/src/actors/character-actor.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hology/core/gameplay */ \"@hology/core/gameplay\");\n/* harmony import */ var _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @hology/core/gameplay/actors */ \"@hology/core/gameplay/actors\");\n/* harmony import */ var _hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ \"three\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_2__);\nObject(function webpackMissingModule() { var e = new Error(\"Cannot find module '../three/FBXLoader'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }());\nObject(function webpackMissingModule() { var e = new Error(\"Cannot find module '../three/GLTFLoader'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }());\n/* harmony import */ var _shooting_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shooting-component */ \"../../../hology-examples/third-person-shooter/src/actors/shooting-component.ts\");\nvar __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {\n    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n    if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);\n    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n    return c > 3 && r && Object.defineProperty(target, key, r), r;\n};\nvar __metadata = (undefined && undefined.__metadata) || function (k, v) {\n    if (typeof Reflect === \"object\" && typeof Reflect.metadata === \"function\") return Reflect.metadata(k, v);\n};\n\n\n\n\n\n\n\nvar MovementMode;\n(function (MovementMode) {\n    MovementMode[MovementMode[\"walking\"] = 0] = \"walking\";\n    MovementMode[MovementMode[\"swimming\"] = 1] = \"swimming\";\n    MovementMode[MovementMode[\"falling\"] = 2] = \"falling\";\n    MovementMode[MovementMode[\"flying\"] = 3] = \"flying\";\n})(MovementMode || (MovementMode = {}));\nlet CharacterActor = class CharacterActor extends _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.BaseActor {\n    constructor() {\n        super();\n        this.physicsSystem = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.inject)(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.PhysicsSystem);\n        this.shooting = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.attach)(_shooting_component__WEBPACK_IMPORTED_MODULE_4__[\"default\"]);\n        this.height = 2.5;\n        this.radius = 1.6;\n        this.isCrouching = false;\n        this.viewController = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.inject)(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.ViewController);\n        this.animation = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.attach)(_hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_1__.CharacterAnimationComponent);\n        this.mesh = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.attach)(_hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_1__.MeshComponent);\n        this.thirdPartyCamera = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.attach)(_hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_1__.ThirdPartyCameraComponent);\n        this.movement = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.attach)(_hology_core_gameplay_actors__WEBPACK_IMPORTED_MODULE_1__.CharacterMovementComponent, {\n            autoStepMaxHeight: 0,\n            colliderHeight: 2.2,\n            colliderRadius: .6,\n            maxWalkingSlopeAngle: 70,\n            maxSpeed: 3,\n            maxSpeedBackwards: 3,\n            maxSpeedSprint: 7,\n        });\n        this.world = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.inject)(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.World);\n    }\n    async createGraph(loader, mesh) {\n        const clips = await loadClips(loader, {\n            run: 'assets/rifle run.fbx',\n            walking: 'assets/rifle walking.fbx',\n            walkForwardLeft: 'assets/walk forward left.fbx',\n            walkForwardRight: 'assets/walk forward right.fbx',\n            walkingBackwards: 'assets/walking backwards.fbx',\n            idle: 'assets/rifle aiming idle.fbx',\n            startWalking: 'assets/start walking.fbx',\n            jump: 'assets/jump forward.fbx',\n            falling: 'assets/falling idle.fbx',\n            strafeLeft: 'assets/strafe (2).fbx',\n            strafeRight: 'assets/strafe.fbx',\n            reload: 'assets/reload.fbx',\n            land: 'assets/hard landing.fbx',\n        });\n        const rootBone = mesh.children.find(c => c instanceof three__WEBPACK_IMPORTED_MODULE_2__.Bone);\n        if (rootBone == null) {\n            throw new Error(\"No root bone found in mesh\");\n        }\n        const makeSm = () => {\n            const grounded = new _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.AnimationState(clips.idle).named(\"grounded\");\n            const groundMovement = grounded.createChild(null, () => this.movement.horizontalSpeed > 0 && this.movement.mode == MovementMode.walking);\n            const [sprint, walk] = groundMovement.split(() => this.movement.isSprinting);\n            const walkForward = walk.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.walking, true), () => this.movement.directionInput.vertical > 0).named(\"walk forward\");\n            walkForward.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.walkForwardLeft, true), () => this.movement.directionInput.horizontal < 0);\n            walkForward.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.walkForwardRight, true), () => this.movement.directionInput.horizontal > 0);\n            walk.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.walkingBackwards, true), () => this.movement.directionInput.vertical < 0);\n            const strafe = walk.createChild(null, () => this.movement.directionInput.vertical == 0).named(\"abstract strafe\");\n            strafe.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.strafeLeft, true), () => this.movement.directionInput.horizontal < 0);\n            strafe.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.strafeRight, true), () => this.movement.directionInput.horizontal > 0);\n            const fall = new _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.AnimationState(clips.falling).named(\"fall\");\n            grounded.transitionsTo(fall, () => this.movement.mode === MovementMode.falling);\n            const land = new _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.AnimationState(clips.land);\n            fall.transitionsTo(grounded, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() > 0);\n            fall.transitionsTo(land, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() == 0);\n            land.transitionsOnComplete(grounded, () => this.movement.mode === MovementMode.falling || this.movement.directionInput.vector.length() > 0);\n            const runForward = sprint.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.run, true), () => this.movement.directionInput.vertical > 0).named(\"sprint forward\");\n            runForward.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.walkForwardLeft, true), () => this.movement.directionInput.horizontal < 0);\n            runForward.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.walkForwardRight, true), () => this.movement.directionInput.horizontal > 0);\n            sprint.createChild(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.walkingBackwards, true), () => this.movement.directionInput.vertical < 0).named(\"sprint back\");\n            // This is a shortcut to reuse another state. This should be used with caution though as it may not have expected results\n            sprint.transitionsTo(strafe);\n            //sprint.transitionsTo(strafeLeft, () => this.movement.directionInput.horizontal < 0)\n            //sprint.transitionsTo(strafeRight, () => this.movement.directionInput.horizontal > 0)\n            return new _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.AnimationStateMachine(grounded);\n        };\n        return { sm: makeSm(), clips };\n    }\n    async onInit() {\n        // Using draco compression can reduce the file size by 2x\n        //const dracoLoader = new DRACOLoader();\n        //dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path\n        const loader = new Object(function webpackMissingModule() { var e = new Error(\"Cannot find module '../three/FBXLoader'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())();\n        const glbLoader = new Object(function webpackMissingModule() { var e = new Error(\"Cannot find module '../three/GLTFLoader'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())();\n        //glbLoader.setDRACOLoader(dracoLoader);\n        const characterMeshPath = 'assets/X Bot.fbx';\n        //const mesh = (await glbLoader.loadAsync('assets/X Bot compressed.glb')).scene as unknown as Mesh\n        const mesh = await loader.loadAsync(characterMeshPath);\n        const weaponMeshGroup = (await glbLoader.loadAsync('assets/weapon.glb')).scene;\n        weaponMeshGroup.children.shift(); // Remove first armature\n        // TODO Change gltf loader to be able to exclude armatures\n        const weaponMesh = weaponMeshGroup;\n        console.log(weaponMesh);\n        //this.world.scene.add(weaponMesh)\n        //mesh.rotateY(Math.PI)\n        weaponMesh.scale.multiplyScalar(20);\n        let handBone;\n        mesh.traverse(o => {\n            if (o.name.includes('mixamorigRightHand') && handBone == null) {\n                handBone = o;\n            }\n            console.log(o.name);\n        });\n        handBone.add(weaponMesh);\n        weaponMesh.traverse(o => {\n            if (o.name === 'SO_Muzzle') {\n                this.muzzleObject = o;\n            }\n        });\n        const characterMaterial = new three__WEBPACK_IMPORTED_MODULE_2__.MeshStandardMaterial({ color: 0x999999 });\n        mesh.traverse(o => {\n            if (o instanceof three__WEBPACK_IMPORTED_MODULE_2__.Mesh) {\n                o.material = characterMaterial;\n                o.castShadow = true;\n            }\n        });\n        const meshRescaleFactor = 1 / 50;\n        mesh.scale.multiplyScalar(meshRescaleFactor);\n        const { sm, clips } = await this.createGraph(loader, mesh);\n        this.animation.playStateMachine(sm);\n        this.animation.setup(mesh, [findBone(mesh, \"mixamorigSpine2\")]);\n        this.viewController.tick.subscribe(deltaTime => {\n            this.animation.movementSpeed = this.movement.horizontalSpeed / mesh.scale.x;\n        });\n        const spineBone = findBone(mesh, \"mixamorigSpine1\");\n        // An improvement could be to apply the rotation to a chain of bones uniformly \n        // to get a smoother curve of the upper body\n        // This should happen after animation is updated. I am just lucky that it works here\n        let elapsedTime = 0;\n        this.viewController.tick.subscribe(deltaTime => {\n            elapsedTime += deltaTime;\n            if (this.movement.mode !== MovementMode.falling) {\n                const meshWorldRotation = this.container.getWorldQuaternion(new three__WEBPACK_IMPORTED_MODULE_2__.Quaternion());\n                const worldRotation = spineBone.getWorldQuaternion(new three__WEBPACK_IMPORTED_MODULE_2__.Quaternion());\n                const axis = new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(-1, 0, 0).normalize();\n                axis.applyQuaternion(worldRotation.invert().multiply(meshWorldRotation));\n                //const rotation = Math.PI * Math.sin(elapsedTime) * 0.5\n                spineBone.rotateOnAxis(axis, Math.asin(-this.thirdPartyCamera.rotationInput.rotation.x));\n            }\n        });\n        // Need a way to play just the reload animation\n        const reloadClip = _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.RootMotionClip.fromClip(clips.reload);\n        reloadClip.fixedInPlace = false;\n        reloadClip.duration -= 1; // Cut off the end of it \n        setInterval(() => {\n            //this.animation.playUpper(reloadClip, {priority: 5, loop: false})\n        }, 6000);\n        this.mesh.replaceMesh(mesh);\n    }\n    shoot() {\n        if (this.movement.mode === MovementMode.walking) {\n            this.shooting.camera = this.thirdPartyCamera.camera.instance;\n            this.muzzleObject.getWorldPosition(ballWorldPosition);\n            this.shooting.trigger(ballWorldPosition);\n        }\n    }\n    moveTo(position) {\n        this.container.position.copy(position);\n        this.physicsSystem.updateActorTransform(this);\n    }\n};\nCharacterActor = __decorate([\n    (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.Actor)(),\n    __metadata(\"design:paramtypes\", [])\n], CharacterActor);\nconst ballWorldPosition = new three__WEBPACK_IMPORTED_MODULE_2__.Vector3();\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CharacterActor);\n/**\n * Use something similar to this that also works with assets.\n * You provide a an object to hold all clips to load and you pass in some sort\n * of reference for each of them to the animation clip asset.\n *\n * This reduces a lot of boilerplate.\n * I could even use code generation to load it.\n */\nasync function getClip(file, loader, name) {\n    const group = await loader.loadAsync(file);\n    const clips = group.animations;\n    if (name != null) {\n        return clips.find(c => c.name === 'name');\n    }\n    return clips[0];\n}\nasync function loadClips(loader, paths) {\n    const entries = await Promise.all(Object.entries(paths).map(([name, path]) => Promise.all([name, getClip(path, loader)])));\n    return Object.fromEntries(entries);\n}\nfunction findBone(object, name) {\n    let found;\n    object.traverse(o => {\n        if (o instanceof three__WEBPACK_IMPORTED_MODULE_2__.Bone && o.name === name) {\n            if (!found || found.children.length < o.children.length) {\n                found = o;\n            }\n        }\n    });\n    return found;\n}\n\n\n//# sourceURL=webpack://actors/../../../hology-examples/third-person-shooter/src/actors/character-actor.ts?");

/***/ }),

/***/ "../../../hology-examples/third-person-shooter/src/actors/index.ts":
/*!*************************************************************************!*\
  !*** ../../../hology-examples/third-person-shooter/src/actors/index.ts ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _character_actor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./character-actor */ \"../../../hology-examples/third-person-shooter/src/actors/character-actor.ts\");\n/* harmony import */ var _ball_actor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ball-actor */ \"../../../hology-examples/third-person-shooter/src/actors/ball-actor.ts\");\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n    'character': _character_actor__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\n    'ball': _ball_actor__WEBPACK_IMPORTED_MODULE_1__[\"default\"]\n});\n\n\n//# sourceURL=webpack://actors/../../../hology-examples/third-person-shooter/src/actors/index.ts?");

/***/ }),

/***/ "../../../hology-examples/third-person-shooter/src/actors/shooting-component.ts":
/*!**************************************************************************************!*\
  !*** ../../../hology-examples/third-person-shooter/src/actors/shooting-component.ts ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hology/core/gameplay */ \"@hology/core/gameplay\");\n/* harmony import */ var _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"three\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _ball_actor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ball-actor */ \"../../../hology-examples/third-person-shooter/src/actors/ball-actor.ts\");\nvar __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {\n    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n    if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);\n    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n    return c > 3 && r && Object.defineProperty(target, key, r), r;\n};\n\n\n\nlet count = 0;\nconst raycaster = new three__WEBPACK_IMPORTED_MODULE_1__.Raycaster();\nconst screenCenter = { x: 0, y: 0 };\n// Reuse objects rather than creating new instances every time they are used\nconst ballForceVec = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3();\nconst ballOriginVec = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3();\nlet ShootingComponent = class ShootingComponent extends _hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.ActorComponent {\n    constructor() {\n        super(...arguments);\n        this.physics = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.inject)(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.PhysicsSystem);\n        this.world = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.inject)(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.World);\n        this.actorFactory = (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.inject)(_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.ActorFactory);\n        this.shootingStrength = 5;\n    }\n    trigger(position) {\n        if (this.camera == null) {\n            console.warn(\"Camera not set on shooting component\");\n            return;\n        }\n        /*  const from = new Vector3()\n          .copy(this.actor.position)\n          .add(new Vector3(0, 2.5, 0))\n          */\n        raycaster.setFromCamera(screenCenter, this.camera);\n        raycaster.ray.origin;\n        const from = raycaster.ray.origin;\n        const to = from.clone().add(raycaster.ray.direction.multiplyScalar(100));\n        // Ray test to find the hit location\n        // Raycasting from the camera should be a built in feature\n        const result = this.physics.rayTest(from, to, null, {\n            debugColor: 0xff0000,\n            debugLifetime: 5000,\n        });\n        // TODO From should be at the gun\n        // The direction should be calculated based on (result.hitPoint ?? to - gun position)\n        const ballFrom = position ?? from;\n        this.spawnBall(ballFrom, raycaster.ray.direction.normalize());\n        console.log(++count);\n        /**\n         * TODO\n         *\n         * Create a ball that is shot from the player's gun towards the position\n         * using physics. It should be able to collide with objects which moves them.\n         * This should be a more fun and intriguing experience that also looks impressive.\n         */\n        // Bullet traces should origin from the gun to the hit location\n        //this.addHitMarker(result)\n    }\n    async spawnBall(start, direction) {\n        ballOriginVec.addVectors(start, direction.clone().normalize().multiplyScalar(1));\n        const ball = await this.actorFactory.create(_ball_actor__WEBPACK_IMPORTED_MODULE_2__[\"default\"]);\n        this.world.addActor(ball, ballOriginVec);\n        // TODO calling move to should not be necessary.\n        ball.moveTo(ballOriginVec);\n        ballForceVec.copy(direction).multiplyScalar(this.shootingStrength);\n        this.physics.applyImpulse(ball, ballForceVec);\n    }\n    addMarker(pos) {\n        const hitMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(new three__WEBPACK_IMPORTED_MODULE_1__.SphereGeometry(0.3, 4, 4), new three__WEBPACK_IMPORTED_MODULE_1__.MeshLambertMaterial({ color: 0xff0000 }));\n        hitMesh.position.copy(pos);\n        this.world.scene.add(hitMesh);\n        setTimeout(() => {\n            this.world.scene.remove(hitMesh);\n        }, 1000);\n    }\n    addHitMarker(result) {\n        if (result.hasHit) {\n            const hitMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(new three__WEBPACK_IMPORTED_MODULE_1__.SphereGeometry(0.3, 4, 4), new three__WEBPACK_IMPORTED_MODULE_1__.MeshLambertMaterial({ color: 0xff0000 }));\n            hitMesh.position.copy(result.hitPoint);\n            this.world.scene.add(hitMesh);\n            setTimeout(() => {\n                this.world.scene.remove(hitMesh);\n            }, 1000);\n        }\n    }\n};\nShootingComponent = __decorate([\n    (0,_hology_core_gameplay__WEBPACK_IMPORTED_MODULE_0__.Component)()\n], ShootingComponent);\nconst _vec3Tmp = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3();\nconst _vec3Tmp2 = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3();\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ShootingComponent);\n\n\n//# sourceURL=webpack://actors/../../../hology-examples/third-person-shooter/src/actors/shooting-component.ts?");

/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/***/ ((module) => {

module.exports = THREE;

/***/ }),

/***/ "@hology/core/gameplay/actors":
/*!**********************************!*\
  !*** external "__HOLOGY_ACTORS" ***!
  \**********************************/
/***/ ((module) => {

module.exports = __HOLOGY_ACTORS;

/***/ }),

/***/ "@hology/core":
/*!********************************!*\
  !*** external "__HOLOGY_CORE" ***!
  \********************************/
/***/ ((module) => {

module.exports = __HOLOGY_CORE;

/***/ }),

/***/ "@hology/core/gameplay":
/*!*****************************************!*\
  !*** external "__HOLOGY_CORE_GAMEPLAY" ***!
  \*****************************************/
/***/ ((module) => {

module.exports = __HOLOGY_CORE_GAMEPLAY;

/***/ }),

/***/ "@hology/core/shader/parameter":
/*!********************************************!*\
  !*** external "__HOLOGY_SHADER_PARAMETER" ***!
  \********************************************/
/***/ ((module) => {

module.exports = __HOLOGY_SHADER_PARAMETER;

/***/ }),

/***/ "rxjs":
/*!*************************!*\
  !*** external "__RXJS" ***!
  \*************************/
/***/ ((module) => {

module.exports = __RXJS;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("../../../hology-examples/third-person-shooter/src/actors/index.ts");
/******/ 	actors = __webpack_exports__;
/******/ 	
/******/ })()
;