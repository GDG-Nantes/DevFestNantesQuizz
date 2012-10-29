package controllers;

import models.Game;
import models.Player;
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

	public static Result player(String playerPseudo) {
		Player player = new Player();
		player.pseudo = playerPseudo;
		return ok(views.html.player.render(player));
	}

	public static Result startGame() {
		return ok(views.html.game.render(Player.all()));
	}

	public static Result players() {
		return ok(views.html.index.render(Player.all(), playerForm));
	}

	public static Result newPlayer() {
		Form<Player> filledForm = playerForm.bindFromRequest();
		if (filledForm.hasErrors()) {
			return badRequest(views.html.index.render(Player.all(), filledForm));
		} else {
			Player player = filledForm.get();
			Player.create(player);
			Player.all().add(player);
			return redirect(routes.Application.player(player.pseudo));
		}
	}

	/**
	 * Handle the chat websocket.
	 */
	public static WebSocket<String> initWebSocketGame() {
		return new WebSocket<String>() {

			// Called when the Websocket Handshake is done.
			@Override
			public void onReady(WebSocket.In<String> in, final WebSocket.Out<String> out) {

				gameDispatcher.registerGameScreen(out);
			}
		};
	}

	/**
	 * Handle the chat websocket.
	 */
	public static WebSocket<String> websocketPlayer(final String player) {
		return new WebSocket<String>() {

			// Called when the Websocket Handshake is done.
			@Override
			public void onReady(WebSocket.In<String> in, final WebSocket.Out<String> out) {

				gameDispatcher.registerGamePlayer(in);
			}
		};
	}
}