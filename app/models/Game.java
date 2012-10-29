package models;

import java.util.ArrayList;
import java.util.List;

import play.libs.F.Callback;
import play.mvc.WebSocket;

public class Game {

	private WebSocket.Out<String> out;

	private List<WebSocket.In<String>> players = new ArrayList<WebSocket.In<String>>();

	public void registerGameScreen(WebSocket.Out<String> screen) {
		out = screen;
	}

	public void registerGamePlayer(WebSocket.In<String> player) {
		player.onMessage(new Callback<String>() {

			@Override
			public void invoke(String playerLogin) throws Throwable {
				if (out != null) {
					out.write(playerLogin);
				}

			}
		});
	}

}
