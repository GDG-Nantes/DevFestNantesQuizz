package controllers;

import models.Player;
import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;

public class Application extends Controller {

	public static Result index() {
		return redirect(routes.Application.game());
	}

	static Form<Player> playerForm = form(Player.class);

	public static Result game() {
		return ok(views.html.game.render(Player.all(), playerForm));
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
		return TODO;
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
}