package com.example.casthelloworld;

import android.app.Activity;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;

import com.google.android.gms.cast.games.GameManagerClient;

import org.json.JSONException;
import org.json.JSONObject;

public class PlayActivity extends Activity implements SensorEventListener {


    private float lastVal;
    private float[] m_lastMagFields;
    private float[] m_lastAccels;
    private float[] mRotationMatrix;
    private float[] m_remappedR;
    private float[] m_orientation;
    private float[] orientationVals;
    private JSONObject directionMessage;
    GameManagerClient mGameManagerClient;
    SensorManager sManager;
    private GameConnectionManager GCM;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_play);

        m_lastMagFields = new float[3];
        m_lastAccels = new float[3];
        mRotationMatrix = new float[16];
        m_remappedR = new float[16];
        m_orientation = new float[4];
        orientationVals = new float[3];
        directionMessage = new JSONObject();
        GCM = GameConnectionManager.getInstance();
        mGameManagerClient = GCM.getGameManagerClient();
        sManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        sManager.registerListener(this, sManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR), SensorManager.SENSOR_DELAY_GAME);
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

    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }

    @Override
    protected void onStop() {
        // @TODO stop gamemanagercallback
        //mMediaRouter.removeCallback(mMediaRouterCallback);
        sManager.unregisterListener(this);
        super.onStop();
    }
}
