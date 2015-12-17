/*
 * Copyright (C) 2014 Google Inc. All Rights Reserved. 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at 
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and 
 * limitations under the License.
 */

package com.example.casthelloworld;

import com.google.android.gms.cast.ApplicationMetadata;
import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.Cast.ApplicationConnectionResult;
import com.google.android.gms.cast.Cast.MessageReceivedCallback;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.cast.games.GameManagerState;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Result;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.cast.games.GameManagerClient;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

import android.content.Intent;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.view.MenuItemCompat;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.app.MediaRouteActionProvider;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.support.v7.media.MediaRouter.RouteInfo;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;

import android.os.Vibrator;

/**
 * Main activity to send messages to the receiver.
 */
public class MainActivity extends AppCompatActivity implements SensorEventListener {

    private static final String TAG = MainActivity.class.getSimpleName();

    private static final int REQUEST_CODE = 1;

    private MediaRouter mMediaRouter;
    private MediaRouteSelector mMediaRouteSelector;
    private MediaRouter.Callback mMediaRouterCallback;
    private CastDevice mSelectedDevice;
    private GoogleApiClient mApiClient;
    private Cast.Listener mCastListener;
    private ConnectionCallbacks mConnectionCallbacks;
    private ConnectionFailedListener mConnectionFailedListener;
    private HelloWorldChannel mHelloWorldChannel;
    private boolean mApplicationStarted;
    private boolean mWaitingForReconnect;
    private String mSessionId;
    private static GameManagerClient mGameManagerClient;
    private SensorManager sManager;
    private float lastVal;
    private float[] m_lastMagFields;
    private float[] m_lastAccels;
    private float[] mRotationMatrix;
    private float[] m_remappedR;
    private float[] m_orientation;
    private float[] orientationVals;
    private JSONObject directionMessage;
    private Vibrator v;
    private String playerId;
    private boolean waiting;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Fragment fragment = new ConnectFragment();
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.add(R.id.main, fragment, "first");
        transaction.addToBackStack(null);
        transaction.commit();

        waiting = false;

        m_lastMagFields = new float[3];
        m_lastAccels = new float[3];
        mRotationMatrix = new float[16];
        m_remappedR = new float[16];
        m_orientation = new float[4];
        orientationVals = new float[3];
        directionMessage = new JSONObject();
        playerId = "";

        ActionBar actionBar = getSupportActionBar();
        actionBar.setBackgroundDrawable(new ColorDrawable(
                getResources().getColor(android.R.color.transparent)));

        v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        lastVal = 999;
        sManager = (SensorManager) getSystemService(SENSOR_SERVICE);

        // When the user clicks on the button, use Android voice recognition to
        // get text
        /*Button voiceButton = (Button) findViewById(R.id.voiceButton);
        voiceButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                startVoiceRecognitionActivity();
                mGameManagerClient.sendPlayerReadyRequest(null);
            }
        });*/

        // Configure Cast device discovery
        mMediaRouter = MediaRouter.getInstance(getApplicationContext());
        mMediaRouteSelector = new MediaRouteSelector.Builder()
                .addControlCategory(CastMediaControlIntent.categoryForCast(getResources()
                        .getString(R.string.app_id))).build();
        mMediaRouterCallback = new MyMediaRouterCallback();
    }

    /**
     * Android voice recognition
     */
    private void startVoiceRecognitionActivity() {
        /*
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, getString(R.string.message_to_cast));
        startActivityForResult(intent, REQUEST_CODE);*/

        sManager.registerListener(this, sManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR), SensorManager.SENSOR_DELAY_GAME);
    }

    /*
     * Handle the voice recognition response
     *
     * @see android.support.v4.app.FragmentActivity#onActivityResult(int, int,
     * android.content.Intent)
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_CODE && resultCode == RESULT_OK) {
            ArrayList<String> matches = data.getStringArrayListExtra(
                    RecognizerIntent.EXTRA_RESULTS);
            if (matches.size() > 0) {
                Log.d(TAG, matches.get(0));
                sendMessage(matches.get(0));
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onStart() {
        super.onStart();
        // Start media router discovery
        mMediaRouter.addCallback(mMediaRouteSelector, mMediaRouterCallback,
                MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);

    }

    @Override
    protected void onStop() {
        // @TODO stop gamemanagercallback
        mMediaRouter.removeCallback(mMediaRouterCallback);
        sManager.unregisterListener(this);
        super.onStop();
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "onDestroy");
        teardown(true);
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getMenuInflater().inflate(R.menu.main, menu);
        MenuItem mediaRouteMenuItem = menu.findItem(R.id.media_route_menu_item);
        MediaRouteActionProvider mediaRouteActionProvider
                = (MediaRouteActionProvider) MenuItemCompat
                .getActionProvider(mediaRouteMenuItem);
        // Set the MediaRouteActionProvider selector for device discovery.
        mediaRouteActionProvider.setRouteSelector(mMediaRouteSelector);
        return true;
    }

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {

        if (sensorEvent.accuracy == SensorManager.SENSOR_STATUS_UNRELIABLE)
        {
            return;
        }
        //float x = sensorEvent.values[2];

        SensorManager.getRotationMatrixFromVector(mRotationMatrix,
                sensorEvent.values);

        SensorManager
                .remapCoordinateSystem(mRotationMatrix,
                        SensorManager.AXIS_X, SensorManager.AXIS_Z,
                        mRotationMatrix);

        SensorManager.getOrientation(mRotationMatrix, orientationVals);

        orientationVals[2] = (float) Math.toDegrees(orientationVals[2]);

        float Roll =  orientationVals[2];

        /*
        Log.d("SENSOROUTPUT: ", " Yaw: " + orientationVals[0] + "\n Pitch: "
                + orientationVals[1] + "\n Roll (not used): "
                + orientationVals[2]);*/


        if(Roll < -85 && Roll > -95 && lastVal != 0.0f){
           // Log.d("Middle: ", "" + Roll);
            lastVal = 0.0f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll <= -95 && Roll > -105 && lastVal != -0.2f){
           // Log.d("Left", "" + Roll);
            lastVal = -0.2f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll >= -85 && Roll < -75 && lastVal != 0.2f) {
           // Log.d("Right", "" + Roll);
            lastVal = 0.2f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll <= -105 && Roll > -115 && lastVal != -0.4f){
            // Log.d("Left", "" + Roll);
            lastVal = -0.4f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll >= -75 && Roll < -65 && lastVal != 0.4f) {
            // Log.d("Right", "" + Roll);
            lastVal = 0.4f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll <= -115 && Roll > -125 && lastVal != -0.6f){
            // Log.d("Left", "" + Roll);
            lastVal = -0.6f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll >= -65 && Roll < -55 && lastVal != 0.6f) {
            // Log.d("Right", "" + Roll);
            lastVal = 0.6f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll <= -125 && Roll > -135 && lastVal != -0.8f){
            // Log.d("Left", "" + Roll);
            lastVal = -0.8f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll >= -55 && Roll < -45 && lastVal != 0.8f) {
            // Log.d("Right", "" + Roll);
            lastVal = 0.8f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll <= -135 && lastVal != -1.0f && lastVal != 1.0f){
            // Log.d("Left", "" + Roll);
            lastVal = -1.0f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }else if(Roll >= -45 && lastVal != 1.0f && lastVal != -1.0f) {
            // Log.d("Right", "" + Roll);
            lastVal = 1.0f;
            try {
                directionMessage.put("direction", (double) lastVal);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mGameManagerClient.sendGameMessage(directionMessage);
        }
//        Log.d("X val : ", "" + sensorEvent.values[0]);


/*
        if (SensorManager.getRotationMatrix(m_rotationMatrix, null,
                m_lastAccels, m_lastMagFields)) {
            SensorManager.getOrientation(m_rotationMatrix, m_orientation);

            float yaw = m_orientation[0] * 57.2957795f;
            float pitch = m_orientation[1] * 57.2957795f;
            float roll = m_orientation[2] * 57.2957795f;

            Log.d("Yaw: ", yaw + "");
            Log.d("Pitch: ", pitch + "");
            Log.d("Roll: ", roll + "");

        }


        if(x > 0.3 && !lastVal.equals("One")){
            Log.d("One", "" + x);
            lastVal = "One";
        }else if(x < 0.3 && x > 0.25 &&  !lastVal.equals("Two")){
            Log.d("Two", "" + x);
            lastVal = "Two";
        }else if(x < 0.25 && x > 0.2 && !lastVal.equals("Three")){
            Log.d("Three", "" + x);
            lastVal = "Three";
        }else if(x < 0.2 && x > 0.15 && !lastVal.equals("Four")){
            Log.d("Four", "" + x);
            lastVal = "Four";
        } else if(x < 0.15 && x > 0.1 && !lastVal.equals("Five")){
            Log.d("Five", "" + x);
            lastVal = "Five";
        } else if(x < 0.1 && x > 0.05 && !lastVal.equals("Six")){
            Log.d("Six", "" + x);
            lastVal = "Six";
        }  else if(x < 0.05 && x > 0 && !lastVal.equals("Seven")){
            Log.d("Seven", "" + x);
            lastVal = "Seven";
        } else if(x < 0 && !lastVal.equals("Eight")){
            Log.d("Eight", "" + x);
            lastVal = "Eight";
        }*/
/*
        Log.d("SENSORCHANGED", "Roll :"+ Float.toString(sensorEvent.values[2]) +"\n"+
                "Pitch :"+ Float.toString(sensorEvent.values[1]) +"\n"+
                "Yaw :"+ Float.toString(sensorEvent.values[0]));
*/

    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }

    public void lobbyClosed() {
        waiting = true;
        Fragment fragment = new MatchOngoingFragment();
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.replace(R.id.main, fragment, "first");
        transaction.addToBackStack(null);
        transaction.commit();
    }

    public void lobbyOpen() {
        Fragment fragment = new LobbyFragment();
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.replace(R.id.main, fragment, "first");
        transaction.addToBackStack(null);
        transaction.commit();
    }

    /**
     * Callback for MediaRouter events
     */
    private class MyMediaRouterCallback extends MediaRouter.Callback {

        @Override
        public void onRouteSelected(MediaRouter router, RouteInfo info) {
            Log.d(TAG, "onRouteSelected");
            // Handle the user route selection.
            mSelectedDevice = CastDevice.getFromBundle(info.getExtras());

            launchReceiver();
        }

        @Override
        public void onRouteUnselected(MediaRouter router, RouteInfo info) {
            Log.d(TAG, "onRouteUnselected: info=" + info);
            teardown(false);
            mSelectedDevice = null;
        }
    }

    /**
     * Start the receiver app
     */
    private void launchReceiver() {
        try {
            mCastListener = new Cast.Listener() {

                @Override
                public void onApplicationDisconnected(int errorCode) {
                    Log.d(TAG, "application has stopped");
                    teardown(true);
                }

            };
            // Connect to Google Play services
            mConnectionCallbacks = new ConnectionCallbacks();
            mConnectionFailedListener = new ConnectionFailedListener();
            Cast.CastOptions.Builder apiOptionsBuilder = Cast.CastOptions
                    .builder(mSelectedDevice, mCastListener);
            mApiClient = new GoogleApiClient.Builder(this)
                    .addApi(Cast.API, apiOptionsBuilder.build())
                    .addConnectionCallbacks(mConnectionCallbacks)
                    .addOnConnectionFailedListener(mConnectionFailedListener)
                    .build();

            mApiClient.connect();
        } catch (Exception e) {
            Log.e(TAG, "Failed launchReceiver", e);
        }
    }

    /**
     * Google Play services callbacks
     */
    private class ConnectionCallbacks implements
            GoogleApiClient.ConnectionCallbacks {

        @Override
        public void onConnected(Bundle connectionHint) {
            Log.d(TAG, "onConnected");

            if (mApiClient == null) {
                // We got disconnected while this runnable was pending
                // execution.
                return;
            }

            try {
                if (mWaitingForReconnect) {
                    mWaitingForReconnect = false;

                    // Check if the receiver app is still running
                    if ((connectionHint != null)
                            && connectionHint.getBoolean(Cast.EXTRA_APP_NO_LONGER_RUNNING)) {
                        Log.d(TAG, "App  is no longer running");
                        teardown(true);
                    } else {
                        // Re-create the custom message channel
                        try {
                            Cast.CastApi.setMessageReceivedCallbacks(
                                    mApiClient,
                                    mHelloWorldChannel.getNamespace(),
                                    mHelloWorldChannel);
                        } catch (IOException e) {
                            Log.e(TAG, "Exception while creating channel", e);
                        }
                    }
                } else {
                    // Launch the receiver app
                    Cast.CastApi.launchApplication(mApiClient, getString(R.string.app_id), false)
                            .setResultCallback(new LaunchReceiverApplicationResultCallback());
                               /*     new ResultCallback<Cast.ApplicationConnectionResult>() {
                                        @Override
                                        public void onResult(
                                                ApplicationConnectionResult result) {
                                            Status status = result.getStatus();
                                            Log.d(TAG,
                                                    "ApplicationConnectionResultCallback.onResult:"
                                                            + status.getStatusCode());
                                            if (status.isSuccess()) {
                                                ApplicationMetadata applicationMetadata = result
                                                        .getApplicationMetadata();
                                                mSessionId = result.getSessionId();
                                                String applicationStatus = result
                                                        .getApplicationStatus();
                                                boolean wasLaunched = result.getWasLaunched();
                                                Log.d(TAG, "application name: "
                                                        + applicationMetadata.getName()
                                                        + ", status: " + applicationStatus
                                                        + ", sessionId: " + mSessionId
                                                        + ", wasLaunched: " + wasLaunched);
                                                mApplicationStarted = true;

                                                // Create the custom message
                                                // channel
                                                mHelloWorldChannel = new HelloWorldChannel();
                                                try {
                                                    Cast.CastApi.setMessageReceivedCallbacks(
                                                            mApiClient,
                                                            mHelloWorldChannel.getNamespace(),
                                                            mHelloWorldChannel);
                                                } catch (IOException e) {
                                                    Log.e(TAG, "Exception while creating channel",
                                                            e);
                                                }

                                                // set the initial instructions
                                                // on the receiver
                                                sendMessage(getString(R.string.instructions));
                                            } else {
                                                Log.e(TAG, "application could not launch");
                                                teardown(true);
                                            }
                                        }
                                    });*/
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to launch application", e);
            }
        }

        @Override
        public void onConnectionSuspended(int cause) {
            Log.d(TAG, "onConnectionSuspended");
            mWaitingForReconnect = true;
        }
    }

    /**
     * Google Play services callbacks
     */
    private final class LaunchReceiverApplicationResultCallback implements
            ResultCallback<ApplicationConnectionResult> {
        private String mCastSessionId;

        @Override
        public void onResult(ApplicationConnectionResult result) {
            Status status = result.getStatus();
            ApplicationMetadata appMetaData = result.getApplicationMetadata();
            if (status.isSuccess()) {
                Log.d(TAG, "Launching game: " + appMetaData.getName());
                mCastSessionId = result.getSessionId();
                GameManagerClient.getInstanceFor(mApiClient, mCastSessionId)
                        .setResultCallback(new ResultCallback<GameManagerClient.GameManagerInstanceResult>() {
                            @Override
                            public void onResult(GameManagerClient.GameManagerInstanceResult result) {
                                mGameManagerClient = result.getGameManagerClient();
                                Log.d(TAG, "GameManagerClient onResult: " + result.getGameManagerClient());
                                Fragment fragment = new LoginFragment();
                                FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
                                transaction.replace(R.id.main, fragment, "first");
                                transaction.addToBackStack(null);
                                transaction.commit();
                                mGameManagerClient.setListener(new DebuggerListener());
                                // mGameManagerClient.setList
                            }
                        });
            } else {
                Log.d(TAG, "Unable to launch the the game. statusCode: " + result);
                //setSelectedDevice(null);
            }
        }
    }


    private class DebuggerListener implements GameManagerClient.Listener {

        //private TextView mTextViewLobbyState;
        //private TextView mTextViewGameplayState;
        //private TextView mTextViewGameData;

        @Override
        public void onStateChanged(GameManagerState currentState, GameManagerState previousState) {
            if (currentState.hasLobbyStateChanged(previousState)) {
                Log.d(TAG, "onLobbyStateChange: " + currentState.getLobbyState());
                //mTextViewLobbyState.setText(currentState.getLobbyState());
            }
            if (currentState.hasGameplayStateChanged(previousState)) {
                Log.d(TAG, "onGameplayStateChanged: " + currentState);
                //mTextViewGameplayState.setText(
                    //    currentState.getGameplayState());
            }
            if (currentState.hasGameDataChanged(previousState)) {
                String text = currentState.getGameData() != null
                        ? currentState.getGameData().toString() : "";
                Log.d(TAG, "onGameDataChanged: " + text);
                //if(text=="DEATH"){
                //}
                //mTextViewGameData.setText(text);
            }
        }

        @Override
        public void onGameMessageReceived(String s, JSONObject jsonObject) {
            try {
                Log.d("ONMSGRECIEVE", (String) jsonObject.get("message"));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            //if (s.equals(mGameManagerClient.getLastUsedPlayerId())) {
                try {
                    if (jsonObject.get("message").equals("LOBBY_join")){
                        Log.d("LOBBY", "join");
                        Fragment fragment = new LobbyFragment();
                        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
                        transaction.replace(R.id.main, fragment, "first");
                        transaction.addToBackStack(null);
                        transaction.commit();
                    } else if (jsonObject.get("message").equals("LOBBY_closed")){
                        waiting = true;
                        Fragment fragment = new MatchOngoingFragment();
                        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
                        transaction.replace(R.id.main, fragment, "first");
                        transaction.addToBackStack(null);
                        transaction.commit();
                        Log.d("LOBBY", "close");
                    } else if (jsonObject.get("message").equals("You are now playing")){
                        startVoiceRecognitionActivity();
                        Fragment fragment = new PlayFragment();
                        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
                        transaction.replace(R.id.main, fragment, "first");
                        transaction.addToBackStack(null);
                        transaction.commit();
                        Log.d("LOBBY", "close");
                    } else if (jsonObject.get("message").equals("LOBBY_open")){
                        waiting = false;
                        Fragment fragment = new LobbyFragment();
                        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
                        transaction.replace(R.id.main, fragment, "first");
                        transaction.addToBackStack(null);
                        transaction.commit();
                        Log.d("LOBBY", "close");
                    } else if (jsonObject.get("message").equals("SCORE_update") && waiting){
                        String leader = (String) jsonObject.get("leader");
                        int leader_score = (int) jsonObject.get("leader_score");
                        int goal_score = (int) jsonObject.get("goal_score");
                        MatchOngoingFragment.updateStandings(leader, ""+leader_score, ""+goal_score);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        //}
    }

    private class ConnectionFailedListener implements
            GoogleApiClient.OnConnectionFailedListener {

        @Override
        public void onConnectionFailed(ConnectionResult result) {
            Log.e(TAG, "onConnectionFailed ");

            teardown(false);
        }
    }

    /**
     * Tear down the connection to the receiver
     */
    private void teardown(boolean selectDefaultRoute) {
        Log.d(TAG, "teardown");
        if (mApiClient != null) {
            if (mApplicationStarted) {
                if (mApiClient.isConnected() || mApiClient.isConnecting()) {
                    try {
                        Cast.CastApi.stopApplication(mApiClient, mSessionId);
                        if (mHelloWorldChannel != null) {
                            Cast.CastApi.removeMessageReceivedCallbacks(
                                    mApiClient,
                                    mHelloWorldChannel.getNamespace());
                            mHelloWorldChannel = null;
                        }
                    } catch (IOException e) {
                        Log.e(TAG, "Exception while removing channel", e);
                    }
                    mApiClient.disconnect();
                }
                mApplicationStarted = false;
            }
            mApiClient = null;
        }
        if (selectDefaultRoute) {
            mMediaRouter.selectRoute(mMediaRouter.getDefaultRoute());
        }
        mSelectedDevice = null;
        mWaitingForReconnect = false;
        mSessionId = null;
    }

    /**
     * Send a text message to the receiver
     */
    private void sendMessage(String message) {
        if (mApiClient != null && mHelloWorldChannel != null) {
            try {
                Cast.CastApi.sendMessage(mApiClient,
                        mHelloWorldChannel.getNamespace(), message).setResultCallback(
                        new ResultCallback<Status>() {
                            @Override
                            public void onResult(Status result) {
                                if (!result.isSuccess()) {
                                    Log.e(TAG, "Sending message failed");
                                }
                            }
                        });
            } catch (Exception e) {
                Log.e(TAG, "Exception while sending message", e);
            }
        } else {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Custom message channel
     */
    class HelloWorldChannel implements MessageReceivedCallback {

        /**
         * @return custom namespace
         */
        public String getNamespace() {
            return getString(R.string.namespace);
        }

        /*
         * Receive message from the receiver app
         */
        @Override
        public void onMessageReceived(CastDevice castDevice, String namespace,
                String message) {
            Log.d(TAG, "onMessageReceived: " + message);
        }

    }

    public static GameManagerClient getmGameManagerClient(){
        return mGameManagerClient;
    }

}


