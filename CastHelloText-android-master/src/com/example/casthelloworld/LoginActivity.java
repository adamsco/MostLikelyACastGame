package com.example.casthelloworld;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.google.android.gms.cast.games.GameManagerClient;
import com.google.android.gms.cast.games.GameManagerState;
import com.google.android.gms.common.api.ResultCallback;

import org.json.JSONException;
import org.json.JSONObject;

public class LoginActivity extends Activity {
    private JSONObject usernameMessage;
    private GameManagerClient mGameManagerClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        usernameMessage = new JSONObject();

        mGameManagerClient = GameConnectionManager.getGameManagerClient();


        Button voiceButton = (Button) findViewById(R.id.lobbyButton);
        voiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                EditText x = (EditText) (findViewById(R.id.userNameText));
                Log.d("USRNAMETEXT: ", x.getText().toString());
                try {
                    usernameMessage.put("username", x.getText().toString());
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                mGameManagerClient.sendPlayerAvailableRequest(null, usernameMessage);
            }
        });


    }

}
