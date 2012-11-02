package controllers;

import models.Game;
import models.Player;

import org.codehaus.jackson.JsonNode;

import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;

public class Application extends Controller {

	static Form<Player> playerForm = form(Player.class);

	static Game gameDispatcher = new Game();

	public static Result index() {
		return redirect(routes.Application.game());
	}

	public static Result game() {
		return ok(views.html.index_game.render(Player.all(), playerForm));
	}

	public static Result resetGame() {
		Player.all().clear();
		return redirect(routes.Application.game());
	}

	public static Result player(String playerId) {
		Player player = Player.get(Integer.valueOf(playerId));
		if (player != null) {
			return ok(views.html.player.render(player));
		} else {
			return badRequest(views.html.index_game.render(Player.all(), playerForm));
		}
	}

	public static Result startGame() {
		return ok(views.html.game.render(Player.all()));
	}

	public static Result newPlayer() {
		Form<Player> filledForm = playerForm.bindFromRequest();
		if (filledForm.hasErrors()) {
			return badRequest(views.html.index_game.render(Player.all(), filledForm));
		} else {
			Player player = filledForm.get();
			Player.create(player);
			Player.all().add(player);
			return redirect(routes.Application.player(String.valueOf(player.id)));
		}
	}

	/**
	 * Handle the chat websocket.
	 */
	public static WebSocket<JsonNode> initWebSocketGame() {
		return new WebSocket<JsonNode>() {

			// Called when the Websocket Handshake is done.
			@Override
			public void onReady(WebSocket.In<JsonNode> in, final WebSocket.Out<JsonNode> out) {

				gameDispatcher.registerGameScreen(out, in);
			}
		};
	}

	/**
	 * Handle the chat websocket.
	 */
	public static WebSocket<JsonNode> websocketPlayer(final Integer playerId) {
		return new WebSocket<JsonNode>() {

			// Called when the Websocket Handshake is done.
			@Override
			public void onReady(WebSocket.In<JsonNode> in, final WebSocket.Out<JsonNode> out) {

				Player player = Player.get(playerId);
				if (player != null) {
					gameDispatcher.registerGamePlayer(in, out, player);
				}
			}
		};
	}
}