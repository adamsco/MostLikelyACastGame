package com.example.casthelloworld;

import android.content.Intent;
import android.util.Log;

import com.google.android.gms.cast.games.GameManagerClient;
import com.google.android.gms.cast.games.GameManagerState;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Johan on 2015-12-17.
 */
public class GameConnectionManager {
    private static GameConnectionManager instance = null;

    private GameManagerClient mGameManagerClient;

    protected GameConnectionManager() {
        // Exists only to defeat instantiation.
    }

    public void initGameManagerClient(GoogleApiClient mApiClient, String mCastSessionId){

        GameManagerClient.getInstanceFor(mApiClient, mCastSessionId)
                .setResultCallback(new ResultCallback<GameManagerClient.GameManagerInstanceResult>() {
                    @Override
                    public void onResult(GameManagerClient.GameManagerInstanceResult result) {
                        mGameManagerClient = result.getGameManagerClient();
                        Log.d("GCM", "GameManagerClient onResult: " + result.getGameManagerClient());
                        mGameManagerClient.setListener(new DebuggerListener());


                        // mGameManagerClient.setList
                    }
                });
    }

    public static GameConnectionManager getInstance() {
        if(instance == null) {
            instance = new GameConnectionManager();
        }
        return instance;
    }

    private class DebuggerListener implements GameManagerClient.Listener {


        @Override
        public void onStateChanged(GameManagerState currentState, GameManagerState previousState) {

        }

        @Override
        public void onGameMessageReceived(String s, JSONObject jsonObject) {
            Log.d("ONMSGRECIEVE", s);
            if (s.equals(mGameManagerClient.getLastUsedPlayerId())) {
                try {
                    if (jsonObject.get("message").equals("LOBBY_join")){
                        //Intent intent = new Intent(LoginActivity.this, LobbyActivity.class);
                        //startActivity(intent);
                        Log.d("LOBBY", "join");

                    } else if (jsonObject.get("message").equals("LOBBY_closed")){
                        //Intent intent = new Intent(LoginActivity.this, MatchOngoingActivity.class);
                        //startActivity(intent);

                        Log.d("LOBBY", "close");
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public GameManagerClient getGameManagerClient(){
        return mGameManagerClient;
    }
}
