package models;

import java.util.ArrayList;
import java.util.List;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;

import play.libs.F.Callback;
import play.libs.F.Callback0;
import play.libs.Json;
import play.mvc.WebSocket;
import play.mvc.WebSocket.In;
import play.mvc.WebSocket.Out;

public class Game {

	private WebSocket.Out<JsonNode> gameOut;
	private WebSocket.Out<JsonNode> gameIn;
	private ArrayList<Out<JsonNode>> playerOutList = new ArrayList<WebSocket.Out<JsonNode>>();

	private List<WebSocket.In<JsonNode>> players = new ArrayList<WebSocket.In<JsonNode>>();
	private List<Player> playerList = new ArrayList<Player>();

	public void registerGameScreen(WebSocket.Out<JsonNode> screen, In<JsonNode> in) {
		gameOut = screen;
		in.onMessage(new Callback<JsonNode>() {

			@Override
			public void invoke(JsonNode event) throws Throwable {
				for (Out<JsonNode> outPlayer : playerOutList) {
					try {
						outPlayer.write(event);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}

			}
		});
		int compt = 0;
		ObjectNode event = null;
		for (Out<JsonNode> outPlayer : playerOutList) {
			try {
				event = Json.newObject();
				event.put("type", "registerDone");
				event.put("id", playerList.get(compt).id);
				outPlayer.write(event);
			} catch (Exception e) {
				e.printStackTrace();
			}
			compt++;
		}
	}

	public void registerGamePlayer(WebSocket.In<JsonNode> player, final Out<JsonNode> out, final Player playerObj) {
		if (this.gameOut != null) {
			ObjectNode event = Json.newObject();
			event.put("type", "register");
			event.put("data", playerObj.pseudo);
			event.put("id", playerObj.id);
			this.gameOut.write(event);
		}
		playerOutList.add(out);
		playerList.add(playerObj);
		player.onMessage(new Callback<JsonNode>() {

			@Override
			public void invoke(JsonNode playerLogin) throws Throwable {
				if (gameOut != null) {
					gameOut.write(playerLogin);
				}

			}
		});

		player.onClose(new Callback0() {

			@Override
			public void invoke() throws Throwable {
				playerOutList.remove(out);
				playerList.remove(out);

			}
		});
	}

}
