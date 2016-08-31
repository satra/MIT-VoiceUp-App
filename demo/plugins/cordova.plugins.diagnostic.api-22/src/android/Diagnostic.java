/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/
package cordova.plugins;

/*
 * Imports
 */
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;

import android.bluetooth.BluetoothAdapter;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.net.wifi.WifiManager;


/**
 * Diagnostic plugin implementation for Android
 */
public class Diagnostic extends CordovaPlugin{

    /**
     * Current Cordova callback context (on this thread)
     */
    protected CallbackContext currentContext;

    /*************
     * Public API
     ************/

    public static final String TAG = "Diagnostic";

    /**
     * Constructor.
     */
    public Diagnostic() {}

    /**
     * Sets the context of the Command. This can then be used to do things like
     * get file paths associated with the Activity.
     *
     * @param cordova The context of the main Activity.
     * @param webView The CordovaWebView Cordova is running in.
     */
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  True if the action was valid, false if not.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        currentContext = callbackContext;

        try {
            if (action.equals("switchToSettings")){
                switchToAppSettings();
                callbackContext.success();
            } else if (action.equals("switchToLocationSettings")){
                switchToLocationSettings();
                callbackContext.success();
            } else if (action.equals("switchToMobileDataSettings")){
                switchToMobileDataSettings();
                callbackContext.success();
            } else if (action.equals("switchToBluetoothSettings")){
                switchToBluetoothSettings();
                callbackContext.success();
            } else if (action.equals("switchToWifiSettings")){
                switchToWifiSettings();
                callbackContext.success();
            } else if(action.equals("isLocationEnabled")) {
                callbackContext.success(isGpsLocationEnabled() || isNetworkLocationEnabled() ? 1 : 0);
            } else if(action.equals("isGpsLocationEnabled")) {
                callbackContext.success(isGpsLocationEnabled() ? 1 : 0);
            } else if(action.equals("isNetworkLocationEnabled")) {
                callbackContext.success(isNetworkLocationEnabled() ? 1 : 0);
            } else if(action.equals("isWifiEnabled")) {
                callbackContext.success(isWifiEnabled() ? 1 : 0);
            } else if(action.equals("isCameraPresent")) {
                callbackContext.success(isCameraPresent() ? 1 : 0);
            } else if(action.equals("isBluetoothEnabled")) {
                callbackContext.success(isBluetoothEnabled() ? 1 : 0);
            } else if(action.equals("setWifiState")) {
                setWifiState(args.getBoolean(0));
                callbackContext.success();
            } else if(action.equals("setBluetoothState")) {
                setBluetoothState(args.getBoolean(0));
                callbackContext.success();
            } else if(action.equals("getLocationMode")) {
                callbackContext.success(getLocationModeName());
            }else {
                handleError("Invalid action");
                return false;
            }
        }catch(Exception e ) {
            handleError("Exception occurred: ".concat(e.getMessage()));
            return false;
        }
        return true;
    }


    public boolean isGpsLocationEnabled() throws Exception {
        int mode = getLocationMode();
        boolean result = (mode == 3 || mode == 1);
        Log.d(TAG, "GPS enabled: " + result);
        return result;
    }

    public boolean isNetworkLocationEnabled() throws Exception {
        int mode = getLocationMode();
        boolean result = (mode == 3 || mode == 2);
        Log.d(TAG, "Network enabled: " + result);
        return result;
    }


    public String getLocationModeName() throws Exception {
        String modeName;
        int mode = getLocationMode();
        switch(mode){
            case Settings.Secure.LOCATION_MODE_HIGH_ACCURACY:
                modeName = "high_accuracy";
                break;
            case Settings.Secure.LOCATION_MODE_SENSORS_ONLY:
                modeName = "device_only";
                break;
            case Settings.Secure.LOCATION_MODE_BATTERY_SAVING:
                modeName = "battery_saving";
                break;
            case Settings.Secure.LOCATION_MODE_OFF:
                modeName = "location_off";
                break;
            default:
                modeName = "unknown";
        }
        return modeName;
    }

    public boolean isWifiEnabled() {
        WifiManager wifiManager = (WifiManager) this.cordova.getActivity().getSystemService(Context.WIFI_SERVICE);
        boolean result = wifiManager.isWifiEnabled();
        return result;
    }

    public boolean isCameraPresent() {
        PackageManager pm = this.cordova.getActivity().getPackageManager();
        boolean result = pm.hasSystemFeature(PackageManager.FEATURE_CAMERA);
        return result;
    }

    public boolean isBluetoothEnabled() {
        BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        boolean result = mBluetoothAdapter != null && mBluetoothAdapter.isEnabled();
        return result;
    }

    public void switchToAppSettings() {
        Log.d(TAG, "Switch to App Settings");
        Intent appIntent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", cordova.getActivity().getPackageName(), null);
        appIntent.setData(uri);
        cordova.getActivity().startActivity(appIntent);
    }

    public void switchToLocationSettings() {
        Log.d(TAG, "Switch to Location Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }

    public void switchToMobileDataSettings() {
        Log.d(TAG, "Switch to Mobile Data Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_DATA_ROAMING_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }

    public void switchToBluetoothSettings() {
        Log.d(TAG, "Switch to Bluetooth Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }

    public void switchToWifiSettings() {
        Log.d(TAG, "Switch to Wifi Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_WIFI_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }

    public void setWifiState(boolean enable) {
        WifiManager wifiManager = (WifiManager) this.cordova.getActivity().getSystemService(Context.WIFI_SERVICE);
        if (enable && !wifiManager.isWifiEnabled()) {
            wifiManager.setWifiEnabled(true);
        } else if (!enable && wifiManager.isWifiEnabled()) {
            wifiManager.setWifiEnabled(false);
        }
    }

    public static boolean setBluetoothState(boolean enable) {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        boolean isEnabled = bluetoothAdapter.isEnabled();
        if (enable && !isEnabled) {
            return bluetoothAdapter.enable();
        }
        else if(!enable && isEnabled) {
            return bluetoothAdapter.disable();
        }
        return true;
    }

    /************
     * Internals
     ***********/
    /**
     * Handles an error while executing a plugin API method  in the specified context.
     * Calls the registered Javascript plugin error handler callback.
     * @param errorMsg Error message to pass to the JS error handler
     */
    private void handleError(String errorMsg, CallbackContext context){
        try {
            Log.e(TAG, errorMsg);
            context.error(errorMsg);
        } catch (Exception e) {
            Log.e(TAG, e.toString());
        }
    }

    /**
     * Handles an error while executing a plugin API method in the current context.
     * Calls the registered Javascript plugin error handler callback.
     * @param errorMsg Error message to pass to the JS error handler
     */
    private void handleError(String errorMsg){
        handleError(errorMsg, currentContext);
    }


    /**
     * Returns current location mode
     */
    private int getLocationMode() throws Exception {
        int mode;
        if (Build.VERSION.SDK_INT >= 19){ // Kitkat and above
            mode = Settings.Secure.getInt(this.cordova.getActivity().getContentResolver(), Settings.Secure.LOCATION_MODE);
        }else{ // Pre-Kitkat
            if(isLocationProviderEnabled(LocationManager.GPS_PROVIDER) && isLocationProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                mode = 3;
            }else if(isLocationProviderEnabled(LocationManager.GPS_PROVIDER)){
                mode = 1;
            }else if(isLocationProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                mode = 2;
            }else{
                mode = 0;
            }
        }
        return mode;
    }

    private boolean isLocationProviderEnabled(String provider) {
        LocationManager locationManager = (LocationManager) this.cordova.getActivity().getSystemService(Context.LOCATION_SERVICE);
        return locationManager.isProviderEnabled(provider);
    }
}
