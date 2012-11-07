package controllers;

import models.Game;
import models.LoginPwd;
import models.Player;
import org.codehaus.jackson.JsonNode;

import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;

public class Application extends Controller {

	static Form<Player> playerForm = form(Player.class);
	static Form<LoginPwd> loginForm = form(LoginPwd.class);

	static Game gameDispatcher = new Game();
	static boolean connectAdmin = false;

	/*
	 * Index global
	 */
	public static Result index() {
		return redirect(routes.Application.registerPlayer());
	}

	/*
	 * 
	 * Game
	 */

	// //
	// //ADMIN
	// //
	public static Result adminGame() {
		return ok(views.html.admin_game.render(loginForm));
	}

	public static Result connectAdminGame() {
		Form<LoginPwd> filledForm = loginForm.bindFromRequest();
		if (filledForm.hasErrors()) {
			return badRequest(views.html.admin_game.render(filledForm));
		} else {
			LoginPwd loginPwd = filledForm.get();
			if ("admin".equals(loginPwd.login) && "@polytech".equals(loginPwd.password)) {
				connectAdmin = true;
				return redirect(routes.Application.game());
			} else {
				return redirect(routes.Application.adminGame());

			}
		}
	}

	public static Result resetGame() {
		if (connectAdmin) {
			connectAdmin = false;
			Player.all().clear();
		}
		return redirect(routes.Application.adminGame());
	}

	// //
	// // GAME
	// //

	public static Result game() {
		if (!connectAdmin) {
			return redirect(routes.Application.adminGame());
		}
		return ok(views.html.game.render(Player.all()));
	}


	/*
	 * Players
	 */

	public static Result registerPlayer() {
		return ok(views.html.index_register_player.render(Player.all(), playerForm));
	}

	public static Result player(String playerId) {
		Player player = Player.get(Integer.valueOf(playerId));
		if (player != null) {
			return ok(views.html.player.render(player));
		} else {
			return badRequest(views.html.index_register_player.render(Player.all(), playerForm));
		}
	}

	public static Result newPlayer() {
		Form<Player> filledForm = playerForm.bindFromRequest();
		if (filledForm.hasErrors()) {
			return badRequest(views.html.index_register_player.render(Player.all(), filledForm));
		} else {
			Player player = filledForm.get();
			Player.create(player);
			Player.all().add(player);
			return redirect(routes.Application.player(String.valueOf(player.id)));
		}
	}

	/*
	 * WebSocket Game
	 */
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

	/*
	 * WebSocket Player
	 */

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