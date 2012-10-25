package models;

import java.util.ArrayList;
import java.util.List;

public class Player {

	public Long id;
	public String pseudo;

	private static final List<Player> list = new ArrayList<Player>();

	public static List<Player> all() {
		return list;
	}

	public static void create(Player player) {

	}

}
