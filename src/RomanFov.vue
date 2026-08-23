<template>
  <v-app id="app" :style="cssVars">
    <div id="main-content">
      <WorldWideTelescope :wwt-namespace="wwtNamespace"></WorldWideTelescope>

      <canvas id="shadow"></canvas>

      <transition name="fade">
        <div class="modal" id="modal-loading" v-show="isLoading">
          <div class="container">
            <div class="spinner"></div>
            <p>Loading …</p>
          </div>
        </div>
      </transition>

    <div id="top-content">
      <div id="left-buttons">
      </div>
      <div id="center-content">
        <div id="coordinates" class="info-box">
          <div class="coordinates-content">
            <span class="coordinate-item">RA: {{ raDisplay }}</span>
            <span class="coordinate-item">Dec: {{ decDisplay }}</span>
          </div>
        </div>
      </div>

      <div id="right-buttons">
        <div id="options">
          <icon-button
            v-if="!showOptions"
            id="options-closed"
            fa-icon="sliders"
            :color="borderColor"
            tooltip-text="Open controls"
            tooltip-location="start"
            @activate="showOptions = !showOptions"
            tabindex="0"
            :border="false"
            background-color="transparent"
          ></icon-button>
          <div 
            id="options-content" 
            v-if="showOptions"
          >
            <div id="options-top-row">
              <v-select
                id="bg-select"
                class="mt-3 ml-1"
                width="165"
                v-model="backgroundImagesetName"
                label="Select Background"
                :items="backgroundImagesets"
                :list-props="{bgColor: backgroundColorDarkest}"
                variant="solo-filled"
                item-title="displayName"
                item-value="imagesetName"
                :bg-color="backgroundColor"
                :item-color="textColor"
                density="compact"
                hide-details
              >
              </v-select>
              <icon-button
                id="options-open"
                class="pt-0 px-0"
                fa-icon="chevron-up"
                :color="borderColor"
                tooltip-text="Close controls"
                tooltip-location="start"
                @activate="showOptions = !showOptions"
                tabindex="0"
                :border="false"
                background-color="transparent"
              ></icon-button>
            </div>
            <div class="centered-content pt-4 pb-3 pl-1">
              <label
                for="footprint-color"
              >
                Footprint Color:
              </label>
              <input
                id="footprint-color"
                class="bordered"
                type="color"
                v-model="footprintColorString"
              />
            </div>
            <div id="crosshairs-row" class="centered-content">
              <v-checkbox
                v-model="crosshairs"
                label="Crosshairs"
                density="compact"
                hide-details
                @keydown.space.prevent="crosshairs = !crosshairs"
                @keydown.enter.prevent="crosshairs = !crosshairs"
              ></v-checkbox>
              <input
                v-show="crosshairs"
                id="crosshairs-color"
                class="bordered"
                type="color"
                v-model="crosshairsColor"
                :disabled="!crosshairs"
              />
            </div>
            <div id="fill-row" class="centered-content">
              <v-checkbox
                v-model="fill"
                label="Fill"
                density="compact"
                hide-details
                @keydown.space.prevent="fill = !fill"
                @keydown.enter.prevent="fill = !fill"
              ></v-checkbox>
              <v-slider
                v-model="fillOpacity"
                :min="0"
                :max="1"
                :step="0.01"
                :disabled="!fill"
                :color="footprintColorString"
                density="compact"
                hide-details
              />
            </div>
            <v-checkbox
              v-model="decimalCoordinates"
              label="Decimal coordinates"
              density="compact"
              hide-details
              @keydown.space.prevent="decimalCoordinates = !decimalCoordinates"
              @keydown.enter.prevent="decimalCoordinates = !decimalCoordinates"
            ></v-checkbox>
            <v-checkbox
              v-model="galactic"
              label="Galactic mode"
              density="compact"
              hide-details
              @keydown.space.prevent="galactic = !galactic"
              @keydown.enter.prevent="galactic = !galactic"            
            ></v-checkbox>
          </div>
        </div>

        <div>
          <icon-button
            id="info-icon"
            v-model="showTextSheet"
            fa-icon="info"
            :color="borderColor"
            tooltip-text="Show User Guide"
            tooltip-location="start"
          >
          </icon-button>          
        </div>
        <div>
          <icon-button
            id="share-icon"
            fa-icon="fa-share-nodes"
            :color="borderColor"
            tooltip-text="Copy share URL"
            tooltip-location="start"
            @activate="copyURLToClipboard"
          >
          </icon-button>
          <v-snackbar
            v-model="snackbar"
            :color="snackbarColor"
          >
            {{ snackbarMessage }}
          </v-snackbar>
        </div>
      </div>
    </div>

    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

    <div id="bottom-content">
    <v-row id="position-layout" align="start" justify="center" class="mb-1">
      <v-col cols="10" md="auto" class="d-flex align-start ga-3 pl-0" style="min-width: 250px;">
        <div class="position-label">Go to</div>
        <simbad-resolver @resolved="handleResolved" :button-color="borderColor" class="flex-grow-1"/>
      </v-col>
      <v-col cols="10" md="6" class="d-flex align-start ga-3 pl-0 flex-grow-1">
        <div class="position-label">or</div>
        <div id="position-form">
          <v-text-field
            @keydown.stop
            v-model="positionSearchRA"
            label="RA"
            density="compact"
            bg-color="black"
            variant="outlined"
            hint="HMS or decimal degrees"
            persistent-hint
          ></v-text-field>
          <v-text-field
            @keydown.stop
            v-model="positionSearchDec"
            label="Dec"
            density="compact"
            bg-color="black"
            variant="outlined"
            hint="DMS or decimal degrees"
            persistent-hint
          ></v-text-field>      
          <v-btn
            @click="() => handlePositionGoToClick(ref(true))"
            :loading="moving"
            :color="borderColor"
            text="Go"
            type="Submit"
            density="comfortable"
            class="mt-1"
          ></v-btn>
        </div>
      </v-col>
    </v-row>
        <v-snackbar
          v-if="positionSearchError"
          :text="positionSearchError"
          type="error"
          density="compact"
          class="pt-2"
          location="top"
        >
        </v-snackbar>
    </div>
    <div id="body-logos" v-if= "!smallSize">
      <credit-logos/>
    </div>


    <v-dialog
      v-model="showInfoDialog"
      :style="cssVars"
      persistent
      :scrim="false"
      id="info-dialog"
      content-class="info-dialog-content"
    >
      <font-awesome-icon
        id="info-close-icon"
        class="close-icon"
        icon="times"
        size="lg"
        @click="showInfoDialog = false"
        @keyup.enter="showInfoDialog = false"
        tabindex="0"
      >
      </font-awesome-icon>
      <div class="intro-card info-text">
        <h3 class="mb-3">
          Quick Start
        </h3>
        <h4>Navigation</h4>
        <ul class="ml-4">
          <v-list-item density="compact">
            <strong>Pan:</strong> Click + drag.
          </v-list-item>
          <v-list-item density="compact">
            <strong>Zoom:</strong> Scroll in and out
          </v-list-item>
          <v-list-item density="compact">
            <strong>Rotate:</strong> Press <strong>ctrl</strong> + click + drag
          </v-list-item>
        </ul>
        <h4 class="mt-2">Buttons</h4>
        <ul>
          <v-list-item density="compact">
            <template v-slot:prepend>
              <font-awesome-icon icon="info" size="lg" class="bullet-icon"></font-awesome-icon>
            </template>
              View all documentation
          </v-list-item>
          <v-list-item density="compact">
            <template v-slot:prepend>
              <font-awesome-icon icon="share-nodes" size="lg" class="bullet-icon"></font-awesome-icon>
            </template>
              <strong>Share</strong> current view. Url will be copied to clipboard and can be pasted in browser.
          </v-list-item>
        </ul>
        <v-card-actions class="pb-0">
          <v-btn
            variant="text"
            :color="accentColor"
            @click="() => {
              autoOpenInfoDialog = false;
              showInfoDialog = false;
            }"
          >
            Don't show again
          </v-btn>
        </v-card-actions>
      </div>
    </v-dialog>

    <!-- WebGL2 not enabled dialog --> 
    <v-dialog
      class="error-dialog"
      :style="cssVars"
      v-model="showWebGL2Dialog"
      persistent
    >
      <v-card>
        <div class="error-message">
          <p>
            <strong>This app requires WebGL 2</strong> 
          </p>
          <p class="mt-2">
            Check your browser's settings and enable WebGL 2 ("graphics acceleration" on some browsers).
          </p> 
          <p class="mt-2">
            You can check whether your browser supports WebGL 2
            and get assistance <a href="https://get.webgl.org/webgl2/" target="_blank" rel="noopener noreferrer">here</a>.
          </p> 
        </div>
      </v-card>
    </v-dialog>

    <!-- This dialog contains the video that is displayed when the video icon is clicked -->

      <v-dialog id="video-container" v-model="showVideoSheet" transition="slide-y-transition" fullscreen>
        <div class="video-wrapper">
          <font-awesome-icon id="video-close-icon" class="close-icon" icon="times" size="lg"
            @click="showVideoSheet = false" @keyup.enter="showVideoSheet = false" tabindex="0"></font-awesome-icon>
          <video controls id="info-video">
            <source src="" type="video/mp4">
          </video>
        </div>
      </v-dialog>


      <!-- This dialog contains the informational content that is displayed when the book icon is clicked -->

    <v-dialog
      :style="cssVars"
      :class="['info-sheet', `info-sheet-${infoSheetLocation}`]"
      id="text-info-sheet"
      hide-overlay
      persistent
      no-click-animation
      absolute
      :scrim="false"
      location="end"
      v-model="showTextSheet"
      :transition="infoSheetTransition"
    >
      <v-card height="100%">
        <v-tabs
          v-model="tab"
          height="32px"
          :color="textColor"
          :slider-color="textColor"
          id="tabs"
          dense
          align-tabs="end"
        >
          <v-tab class="info-tabs" tabindex="0"><h3>User Guide</h3></v-tab>
        </v-tabs>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          icon="times"
          size="lg"
          @click="showTextSheet = false"
          @keyup.enter="showTextSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-window v-model="tab" id="tab-items" class="pb-2 no-bottom-border-radius">
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                <v-container class="pa-0">
                  <h4 class="user-guide-header">WWT Roman View Finder</h4>
                  <p>
                    This <a href="https://www.worldwidetelescope.org/home" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a> (WWT) interactive provides a view of the Roman Space Telescope footprint on the sky.
                  </p>    
                  <h4 class="user-guide-header mt-5">Technical Note</h4>
                  <p>
                    This tool can match potential targets to Roman's field of view, but it is <strong>NOT meant to be used as a precision tool</strong> for planning science observations. WWT's all-sky backgrounds may have small position offsets of 2-3". 
                  </p>
                  <h4 class="user-guide-header mt-5">Sky Navigation</h4>  
                  <p>
                    To navigate the WWT view, use the following controls:                    
                  </p>          
                  <v-row align="center" class="mt-2 mx-3">
                    <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Pan
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong>  {{ touchscreen ? "" : "or" }}  <strong>{{ touchscreen ? "" : "W-A-S-D" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row align="center" class="mx-3">
                    <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Zoom
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? "" : "or" }} <strong>{{ touchscreen ? "" : "I-O" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row align="center" class="mx-3">
                    <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Rotate
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      {{ touchscreen ? "" : "press" }} <strong>{{ touchscreen ? "pinch and twist" : "control + click + drag" }}</strong> {{ touchscreen ? "" : "" }} <strong>{{ touchscreen ? "" : "" }}</strong> {{ touchscreen ? "" : "" }} (Keyboard option coming soon)<br>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <h4 class="user-guide-header">Controls</h4>
                      <ul class="text-list mx-5">
                        <li>
                          <strong>Select Background</strong>: Choose from DSS, 2MASS, SDSS, or unWISE.
                        </li>
                        <li>
                          <strong>Footprint Color</strong>: Adjust as needed to contrast against the background.
                        </li>
                        <li>
                          <strong>Crosshairs</strong>: Show location reported in RA/Dec display and adjust color as needed.
                        </li>                           
                        <li>
                          <strong>Fill</strong>: Fill in footprint squares and adjust opacity.
                        </li>                        
                        <li>
                          <strong>Decimal coordinates</strong>: Display RA/Dec as decimals.
                        </li>   
                        <li>
                          <strong>Galactic mode</strong>: rotate WWT view to follow galactic plane.
                        </li>
                        <li>
                          <font-awesome-icon
                              class="bullet-icon"
                              icon="info"
                              size="lg" 
                            ></font-awesome-icon>
                            View this documentation
                        </li>
                        <li>
                          <font-awesome-icon
                              class="bullet-icon"
                              icon="share-nodes"
                              size="lg" 
                            ></font-awesome-icon>
                            Get link to share current view. Url will be copied to clipboard and can be pasted in browser.
                        </li>       
                      </ul>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <h4 class="user-guide-header">Go to</h4>
                      <ul class="text-list mx-5">
                        <li>
                          <strong>Object Name</strong>: Use SIMBAD search to resolve object names.
                        </li>
                        <p style="color: var(--border-color)"><strong>or</strong></p>
                        <li>
                          <strong>RA</strong>: Right Ascension entered in sexagesimal format (00h00m00s, 00:00:00, or 00 00 00) will be interpreted as hours. Decimal format will be interpreted as degrees.
                        </li>
                        <li>
                          <strong>Dec</strong>: Declination can be entered in sexagesimal format (00&deg;00'00", 00:00:00, or 00 00 00) or in decimal format.
                        </li>                                 
                      </ul>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div class="credits">
                      <h4 class="user-guide-header mt-3">Credits</h4>
                      <h5><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a></h5>
                      <p>Jon Carifio</p>
                      <p>John Lewis</p>
                      <p>Pat Udomprasert</p>
                      <p>Alyssa Goodman</p>

                      <h5><a href="https://www.worldwidetelescope.org/home" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a></h5>
                      <p>Jon Carifio</p>
                      <p>Peter Williams</p>
                      <p>David Weigel</p>
                      </div>
                      <v-spacer class="end-spacer"></v-spacer>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <funding-acknowledgement/>
                    </v-col>
                  </v-row>
                </v-container>              
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
    </v-dialog>      

    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeMount, onMounted, nextTick, type Ref } from "vue";
import { fmtDegLat, fmtHours, D2R, R2D } from "@wwtelescope/astro";
import { Coordinates, Settings, WWTControl } from "@wwtelescope/engine";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, supportsTouchscreen, blurActiveElement, useWWTKeyboardControls } from "@cosmicds/vue-toolkit";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";

import * as wwtlib from "@wwtelescope/engine";

import { drawFootprint } from "./footprint";
import { renderOneFrame, splitString } from "./wwt-hacks";

import { ResolvedObject } from "./simbad_resolvers";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error `Util.splitString` is defined
wwtlib.Util.splitString = splitString;

type SheetType = "text" | "video";
type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface RomanFovProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const store = engineStore();

const {
  backgroundImageset,
  decRad,
  raRad,
} = storeToRefs(store);

const backgroundImagesetName = computed({
  get(): string | undefined {
    return backgroundImageset.value?.get_name();
  },
  set(name: string) {
    store.setBackgroundImageByName(name);
  }
});


useWWTKeyboardControls(store);

const touchscreen = supportsTouchscreen();
const { smAndDown } = useDisplay();

const props = withDefaults(defineProps<RomanFovProps>(), {
  wwtNamespace: "roman-fov",
  initialCameraParams: () => {
    return {
      raRad: 1.4612,
      decRad: -0.09646,
      zoomDeg: 60
    };
  }
});

const backgroundImagesets = reactive<BackgroundImageset[]>([
  new BackgroundImageset("DSS", "Digitized Sky Survey (Color)"),
  new BackgroundImageset("2MASS", "2Mass: Imagery (Infrared)"),
]);
const sheet = ref<SheetType | null>(null);
const layersLoaded = ref(false);
const positionSet = ref(false);

const positionSearchRA = ref<string | null>(null);
const positionSearchDec = ref<string | null>(null);
const positionSearchError = ref<string | null>(null);


// Color palette generated by Claude from https://assets.science.nasa.gov/dynamicimage/assets/science/missions/rst/spacecraft-illustrations/Roman_Title_1.jpg 
// (with some adjustments by me)
// Deep Space Purple #502752(Background)
// Cosmic Violet #632B7D (Background)
// ISM Indigo #8B5FB6 (Call to Action, with Stardust White text)
// pick one accent
// Nebula Magenta #C77FB3 (Accents)
// Stellar Amber #FFB86C (Accents / Contrast)
// Electric Cyan #00F0FF (Accents)
// Soft Lavender #B8A5D4  (Borders)
// Stardust White #F5F0FF  (Background / text on dark)
// Space Black #0A0515  (text on light)
// https://contrast-grid.eightshapes.com/?version=1.1.0&background-colors=&foreground-colors=%23FFFFFF%2C%20white%0D%0A%23502762%2C%20Deep%20Space%20Purple%0D%0A%23632b7d%2C%20Cosmic%20Violet%0D%0A%238B5FB6%2C%20ISM%20Indigo%0D%0A%23C77FB3%2C%20Nebula%20Magenta%0D%0A%23FFB86C%2C%20Stellar%20Amber%0D%0A%2300F0FF%2C%20Electric%20Cyan%0D%0A%23B8A5D4%2C%20Soft%20Lavender%0D%0A%23F5F0FF%2C%20Stardust%20White%0D%0A%230A0515%2C%20Space%20Black%0D%0A%23000000%2C%20black&es-color-form__tile-size=compact&es-color-form__show-contrast=aaa&es-color-form__show-contrast=aa&es-color-form__show-contrast=aa18&es-color-form__show-contrast=dnp

const backgroundColorDarkest = ref("#502752");
const backgroundColor = ref("#632B7D");
const borderColor = ref("#B8A5D4");
const accentColor = ref("#C77FB3");
const textColor = ref("#F5F0FF");
const tab = ref(0);
const footprintColorString = ref("#00F0FF"); // #ff00b7

const decimalCoordinates = ref(false);
const raDisplay = computed(() => {
  return decimalCoordinates.value ? 
    (raRad.value * R2D).toFixed(6) :
    fmtHours(raRad.value, 'h', 'm', 0, 's');
});
const decDisplay = computed(() => {
  return decimalCoordinates.value ? 
    (decRad.value * R2D).toFixed(6) :
    fmtDegLat(decRad.value);
});
const galactic = ref(false);
const crosshairs = ref(false);
const crosshairsColor = ref("#ffffff");
const fill = ref(false);
const fillOpacity = ref(0.5);
const moving = ref(false);

const snackbar = ref(false);
const snackbarColor = ref<"error" | "success">("success");
const snackbarMessage = ref("");

const showInfoDialog = ref(false);
const autoOpenInfoDialog = ref(true);

const settings = Settings.get_active();

const showWebGL2Dialog = ref(false);

function isWebGL2Enabled() {
  // It doesn't seem like there's a better way to do this than just to try and get a context
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/By_example/Detect_WebGL
  // NB: The engine specifically wants a webgl2 context
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  return gl instanceof WebGL2RenderingContext;
}

const AUTO_SHOW_INFO_KEY = "roman-view-finder__auto-show-info";
onBeforeMount(() => {
  autoOpenInfoDialog.value = window.localStorage.getItem(AUTO_SHOW_INFO_KEY)?.toLowerCase() !== "false";
});

onMounted(() => {

  store.waitForReady().then(async () => {

    if (!isWebGL2Enabled()) {
      showWebGL2Dialog.value = true; 
      layersLoaded.value = true;
      positionSet.value = true;
      // eslint-disable-next-lint @typescript-eslint/ban-ts-comment
      // @ts-expect-error `canvas` is defined
      WWTControl.singleton.canvas.setAttribute("hidden", "true");
      WWTControl.singleton.renderOneFrame = function() {};
      return;
    }

    settings.set_galacticMode(galactic.value);
    settings.set_showCrosshairs(crosshairs.value);
    settings.set_crosshairsColor(crosshairsColor.value);

    const control = WWTControl.singleton;
    control.renderOneFrame();
    control.renderOneFrame = renderOneFrame.bind(control);

    const cameraParams = { ...props.initialCameraParams };
    const query = new URLSearchParams(window.location.search);

    const paramNames: Record<string, keyof CameraParams> = {
      "raDeg": "raRad",
      "decDeg": "decRad",
      "zoomDeg": "zoomDeg",
      "rollDeg": "rollRad",
    };
    for (const [queryParam, cameraParam] of Object.entries(paramNames)) {
      const valueString = query.get(queryParam);
      if (valueString == null) {
        continue;
      }
      const value = parseFloat(valueString);
      if (!isNaN(value)) {
        const factor = queryParam === "zoomDeg" ? 1 : D2R;
        cameraParams[cameraParam] = value * factor;
      }
    }

    // control._drawCrosshairs = (_renderContext: RenderContext) => { drawFootprint(WWTControl.singleton); };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    control.renderFrameCallback = function (wwt: WWTControl) {
      drawFootprint(wwt, {
        color: footprintColorString.value,
        fill: fill.value,
        fillOpacity: fillOpacity.value,
      });
    };
    WWTControl.singleton.renderOneFrame();

    store.gotoRADecZoom({
      ...cameraParams,
      instant: true
    }).then(() => positionSet.value = true);

    await store.loadImageCollection({ url: "bg.wtml", loadChildFolders: false }).then(_folder => {
      backgroundImagesets.push(new BackgroundImageset("unWISE", "unWISE color, from W2 and W1 bands"));
      backgroundImagesets.push(new BackgroundImageset("SDSS", "SDSS9 color"));

      const bgName = query.get("bg") ?? "DSS";
      let backgroundName: string | null = null;
      if (bgName) {
        const bgSet = backgroundImagesets.find(bg => bg.displayName === bgName);
        if (bgSet) {
          backgroundName = bgSet.imagesetName; 
        }
      }
      if (backgroundName) {
        backgroundImagesetName.value = backgroundName;
      }
    });

    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, document.title, url.toString());

    // If there are layers to set up, do that here!
    layersLoaded.value = true;

    showInfoDialog.value = autoOpenInfoDialog.value;
  });
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

/* Properties related to device/screen characteristics */
const smallSize = computed(() => smAndDown.value);

/** Values related to setting the info sheet size and position */
const infoFraction = 34;
const tall = computed(() => smAndDown.value);
const widescreenInfoLocation = ref<"right" | "bottom">("right");
const infoSheetLocation = computed(() => tall.value || widescreenInfoLocation.value === "bottom" ? "bottom" : "right");
const infoSheetHeight = computed(() => infoSheetLocation.value === "bottom" ? `${infoFraction}%` : "100%");
const infoSheetWidth = computed(() => infoSheetLocation.value === "bottom" ? "100%" : `${infoFraction}%`);
const infoTextHeight = computed(() => infoSheetLocation.value === "bottom" ? `calc(${infoFraction}vh - 25px)` : "calc(100vh - 25px)");
const infoSheetTransition = computed(() => infoSheetLocation.value === "bottom" ? "dialog-bottom-transition" : "tab-reverse-transition");

/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    "--accent-color": accentColor.value,
    "--background-color-darkest": backgroundColorDarkest.value,
    "--background-color": backgroundColor.value,
    "--border-color": borderColor.value,
    "--text-color": textColor.value,
    "--accent-color-2": footprintColorString.value,
    "--app-content-height": showTextSheet.value && infoSheetLocation.value === "bottom" ? `${100 - infoFraction}%` : "100%",
    "--app-content-width": showTextSheet.value && infoSheetLocation.value === "right" ? `${100 - infoFraction}%` : "100%",
    "--info-sheet-width": infoSheetWidth.value,
    "--info-sheet-height": infoSheetHeight.value,
    "--info-text-height": infoTextHeight.value,
  };
});

const showOptions = ref(!smAndDown.value);
/**
  Computed flags that control whether the relevant dialogs display.
  The `sheet` data member stores which sheet is open, so these are just
  computed wrappers around modifying/querying that which can be used as
  dialog v-model values
*/
const showTextSheet = computed({
  get() {
    return sheet.value === "text";
  },
  set(_value: boolean) {
    selectSheet("text");
  }
});

const showVideoSheet = computed({
  get() {
    return sheet.value === "video";
  },
  set(value: boolean) {
    selectSheet("video");
    if (!value) {
      const video = document.querySelector("#info-video") as HTMLVideoElement;
      video.pause();
    }
  }
});

function selectSheet(sheetType: SheetType | null) {
  if (sheet.value === sheetType) {
    sheet.value = null;
    nextTick(() => {
      blurActiveElement();
    });
  } else {
    sheet.value = sheetType;
  }
}

let timeout: ReturnType<typeof setTimeout> | null = null;
let clickCount = 0;
const DOUBLE_CLICK_INTERVAL_MS = 200;
function handlePositionGoToClick(isActive: Ref<boolean>) {
  clickCount += 1;
  if (timeout != null) {
    clearTimeout(timeout);
  }
  if (clickCount > 1) {
    tryGoToSearchPosition(isActive, true);
    clickCount = 0;
    return;
  }
  timeout = setTimeout(() => {
    tryGoToSearchPosition(isActive, false);
    clickCount = 0;
  }, DOUBLE_CLICK_INTERVAL_MS);
}

function parseRA(data: string): number {
  const lower = data.toLowerCase();
  let hours = false;
  if (['h', ':', ' '].some(c => lower.indexOf(c))) {
    hours = true;
  }
  let ra = Coordinates.parse(lower);
  if (hours) {
    ra *= 15;
  }
  return ra;
}

function tryGoToSearchPosition(menuOpen: Ref<boolean>, instant: boolean = false) {
  positionSearchError.value = null;

  const ra = parseRA(positionSearchRA.value ?? "");
  const dec = Coordinates.parseDec(positionSearchDec.value);

  const raValid = !isNaN(ra);
  const decValid = !isNaN(dec);

  if (raValid && decValid) {
    store.gotoRADecZoom({
      raRad: ra * D2R,
      decRad: dec * D2R,
      zoomDeg: 20,
      instant,
    });
    menuOpen.value = false;
    return;
  }

  const invalid: string[] = [];
  if (!raValid) {
    invalid.push("right ascension");
  }
  if (!decValid) {
    invalid.push("declination");
  }

  const multiple = invalid.length > 1;
  const isAre = multiple ? "are" : "is";
  positionSearchError.value = `Your value${multiple ? 's' : ''} for ${invalid.join(' and ')} ${isAre} invalid`;
}

function shareURL(): string {
  const url = new URL(window.location.href);
  const bgSet = backgroundImagesets.find(bg => bg.imagesetName === backgroundImagesetName.value);
  let search = `raDeg=${store.raRad*R2D}&decDeg=${store.decRad*R2D}&zoomDeg=${store.zoomDeg}&rollDeg=${store.rollRad*R2D}`;
  if (bgSet) {
    search = `${search}&bg=${bgSet.displayName}`;
  }
  url.search = search;
  return url.href;
}

function copyURLToClipboard() {
  navigator.clipboard
    .writeText(shareURL())
    .then(() => {
      snackbarColor.value = "success";
      snackbarMessage.value = "Shareable URL copied to clipboard";
    })
    .catch((_err) => {
      snackbarColor.value = "error";
      snackbarMessage.value = "Failed to copy share URL to clipboard";
    })
    .finally(() => snackbar.value = true);
}

watch(galactic, (gal: boolean) => {
  const raRad = store.raRad;
  const decRad = store.decRad;
  settings.set_galacticMode(gal);
  store.gotoRADecZoom({
    raRad,
    decRad,
    zoomDeg: store.zoomDeg,
    instant: true,
  });
});
watch(crosshairs, (show: boolean) => settings.set_showCrosshairs(show));
watch(crosshairsColor, (color: string) => settings.set_crosshairsColor(color));


function handleResolved(object: ResolvedObject) {
  const {raDeg, decDeg}  = object;
  console.log('Received', object);
  if (raDeg && decDeg) {
    positionSearchRA.value = `${raDeg / 15}`;
    positionSearchDec.value = `${decDeg}`;
  }
  handlePositionGoToClick(ref(true));
}

// const combinedPositionInput = ref('');
// function splitCombinedInput(value: string) {
//   /**
//    * We will accept only simbad compatable formats
//    * The following writings are allowed:
//    * 20 54 05.689 +37 01 17.38
//    * 10:12:45.3-45:17:50
//    * 15h17m-11d10m
//    * 15h17+89d15
//    * 275d11m15.6954s+17d59m59.876s
//    * 12.34567h-17.87654d
//    * 350.123456d-17.33333d <=> 350.123456 -17.33333 
//    */
// }

watch(autoOpenInfoDialog, (open: boolean) => {
  window.localStorage.setItem(AUTO_SHOW_INFO_KEY, open.toString());
});
</script>

<style lang="less">
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap');

@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("./assets/HighwayGothicNarrow.ttf");
}

:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;


  -ms-overflow-style: none;
  scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: "Source Sans 3", Helvetica, sans-serif;
  font-weight: regular;
}

#main-content {
  position: fixed;
  width: var(--app-content-width);
  height: var(--app-content-height);
  overflow: hidden;

  transition: height 0.1s ease-in-out;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 11pt;

  .wwtelescope-component {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}

#shadow {
  width: 100%;
  height: 100%;
  pointer-events: none;
  position: static;
  opacity: 0;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .spinner {
      background-image: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/misc/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }

    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

#top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#center-content {
  display: flex;
  justify-content: center;
  min-width: 0;
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;

  .icon-wrapper {
    min-width: 50px;
    border-radius: 10px;
  }
}

#body-logos {
  position: absolute;
  right: 0.5em;
  bottom: 0.5em;

  #logo-credits img {
    height: 32px !important;
  }

  @media (max-height: 599px) {
    img {
      display: none;
    }
  }
}

// From Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
// checkbox will only get oreo styling when user tabs by keyboard.
:focus-visible, .v-checkbox .v-selection-control__input:has(:focus-visible) {
  outline: 9px double white !important;
  box-shadow: 0 0 0 6px black !important;
  border-radius: .125rem;
}

// Reduce focus indicator for text input fields only (they have their own built-in indicators)
.v-text-field input:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

// Remove oreo focus styling from info dialog
#info-dialog .info-dialog-content:focus-visible, .error-dialog .v-overlay__content:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;

  #video-close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;

    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }
}

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

#info-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 10;
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 15;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
    border: 2px solid white;
  }
}

.intro-card {
  padding: 1em;
}

.info-text {

  p {
    margin-block: 0.5em;
  }

  a {
    color: var(--accent-color-2)
  }

  h3 {
    font-size: 1.4em;
    color: var(--text-color);
  }

  h4 {
    font-size: 1.2em;
    color: var(--border-color);
  }

  h5 {
    font-size: 1em;
    font-weight: bold;
    margin-top: 1em;
  }

  li {
    margin-block: 0.5em;
  }
}

.bullet-icon {
  color: var(--border-color);
  width: 1.2em;
  padding-right: 0.5em;
}


.info-sheet {

  .info-text {
    height: var(--info-text-height);
  }

  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0 !important;
    max-width: 100% !important;
    height: var(--info-sheet-height) !important;
    width: var(--info-sheet-width) !important;
  }

  &.info-sheet-right .v-overlay__content {
    position: absolute;
    top: 0;
    right: 0;
    max-height: 100%;

    & .v-card,
    & .v-card .v-window {
      height: 100%;
    }
  }

  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }

  .scrollable {
    overflow-y: auto;
  }

  #tab-items {
    // padding-bottom: 2px !important;

    .v-card-text {
      font-size: ~"max(14px, calc(0.7em + 0.3vw))";
      padding-top: ~"max(2vw, 16px)";
      padding-left: ~"max(4vw, 16px)";
      padding-right: ~"max(4vw, 16px)";

      .end-spacer {
        height: 25px;
      }
    }

  }

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;

    &:hover {
      cursor: pointer;
    }
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next,
  .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }
}

#bg-select {
  pointer-events: auto;

  &:hover {
    color: var(--accent-color);
    cursor: pointer;
  }
}

.info-box{
  font-size: 0.9rem;
  color: white;
  background: rgba(10, 5, 21, 0.7);
  border: 1px solid;
  border-radius: 5px;
  padding: 0.5rem;
  pointer-events: auto;
  border-color: var(--border-color);
  width: 100%;  
}

#coordinates {

  .coordinates-content {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    row-gap: 0.25rem;
    font-family: monospace;
    justify-content: center;
  }

  .coordinate-item {
    white-space: nowrap;
  }
}

.bordered {
  border: 1px solid #bbbbbb;
  padding-inline: 2px;
  border-radius: 4px;
}

.centered-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

#bottom-content {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: auto;
}

#position-layout {
  font-family: monospace;
}

#position-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  flex-grow: 1
}

.position-label { 
  font-size: 0.9em;
  font-weight: bold;
  width: fit-content;
  white-space: nowrap;
  padding-top: 0.6rem;
}

#options {
  background: black;
  border: 1px solid var(--border-color);
  border-radius: 0.75em;
  pointer-events: auto;

  .icon-wrapper {
    border: none;
  }

  #options-top-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  #options-content {
    padding-inline: 5px;
    padding-bottom: 5px;
  }
  
  input[type="checkbox"] {
    color: var(--border-color);
  }
}

#info-dialog .info-dialog-content {
  width: auto;
  max-width: min(300px, calc(100vw - 2rem));
  max-height: calc(95vh - 1rem);
  overflow-y: auto;
  position: absolute;
  left: 1rem;
  top: 1rem;
  margin: 0 !important;
  border: 1px solid var(--border-color);
  background: rgb(var(--v-theme-surface));
  border-radius: 10px;

  .close-icon {
    top: 10px;
    right: 10px;
  }
}

.error-dialog {
  width: auto;
  height: auto;
  max-width: 425px;
  border-radius: 10px;
}

.error-message {
  padding: 1rem;
  border: 1px solid var(--accent-color);
  text-align: center;
  border-radius: 10px;
}

</style>
