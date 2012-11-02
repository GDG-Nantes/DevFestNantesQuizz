package models;

import java.util.ArrayList;
import java.util.List;

public class Player {

	public int id;
	public String pseudo;

	private static final List<Player> list = new ArrayList<Player>();

	public static List<Player> all() {
		return list;
	}

	public static Player get(int id) {
		synchronized (list) {
			for (Player player : list) {
				if (player.id == id) {
					return player;
				}
			}
		}
		return null;
	}

	public static void create(Player player) {
		player.id = System.identityHashCode(player);
	}

}
