package com.example.casthelloworld;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;

import com.google.android.gms.cast.games.GameManagerClient;
import com.google.android.gms.cast.games.GameManagerState;

import org.json.JSONException;
import org.json.JSONObject;

public class LobbyActivity extends Activity {

    private GameManagerClient mGameManagerClient;
    private GameConnectionManager GCM;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lobby);
        GCM = GameConnectionManager.getInstance();
        mGameManagerClient = GCM.getGameManagerClient();

        final CheckBox readyCheckBox = (CheckBox) findViewById(R.id.checkbox);
        readyCheckBox.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                if(readyCheckBox.isChecked()){
                    mGameManagerClient.sendPlayerReadyRequest(null);
                    System.out.println("Checked");
                }else{
                    mGameManagerClient.sendPlayerAvailableRequest(null);
                    System.out.println("Un-Checked");
                }
            }
        });
    }

    private class DebuggerListener implements GameManagerClient.Listener {

        private String TAG = "";

        @Override
        public void onStateChanged(GameManagerState currentState, GameManagerState previousState) {
            if (currentState.hasLobbyStateChanged(previousState)) {
                Log.d(TAG, "onLobbyStateChange: " + currentState.getLobbyState());
            }
            if (currentState.hasGameplayStateChanged(previousState)) {
                Log.d(TAG, "onGameplayStateChanged: " + currentState);
            }
            if (currentState.hasGameDataChanged(previousState)) {
                String text = currentState.getGameData() != null
                        ? currentState.getGameData().toString() : "";
                Log.d(TAG, "onGameDataChanged: " + text);
            }
        }

        @Override
        public void onGameMessageReceived(String s, JSONObject jsonObject) {
            if (s.equals(mGameManagerClient.getLastUsedPlayerId())) {
            }
        }
    }
}
