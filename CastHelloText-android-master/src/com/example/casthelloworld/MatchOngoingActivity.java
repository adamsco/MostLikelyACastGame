package com.example.casthelloworld;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import com.google.android.gms.cast.games.GameManagerClient;
import com.google.android.gms.cast.games.GameManagerState;

import org.json.JSONException;
import org.json.JSONObject;

public class MatchOngoingActivity extends Activity {

    private GameManagerClient mGameManagerClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_match_ongoing);
        mGameManagerClient = MainActivity.getGameManagerClient();
        mGameManagerClient.setListener(new DebuggerListener());
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
                try {
                    if (jsonObject.get("message").equals("LOBBY_open")) {
                        Intent intent = new Intent(MatchOngoingActivity.this, LobbyActivity.class);
                    } else if (jsonObject.get("message").equals("SCORE_update")){
                        String leader = (String) jsonObject.get("leader");
                        String leader_score = (String) jsonObject.get("leader_score");
                        String goal_score = (String) jsonObject.get("goal_score");
                        TextView t = (TextView)findViewById(R.id.textView4);
                        t.setText(leader + " with " + leader_score + " out of " + goal_score + " points.");
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
