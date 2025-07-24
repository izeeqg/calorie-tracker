import java.util.HashMap;
import java.util.Map;

public class test {
    // 定义节点类
    static class Node {
        int val;
        Node next;
        Node random;  // 额外的随机指针

        public Node(int val) {
            this.val = val;
            this.next = null;
            this.random = null;
        }
    }


    // 方法一：使用HashMap（推荐，易理解）
    public static Node copyRandomList1(Node head) {
        if (head == null) {
            return null;
        }

        Map<Node, Node> map = new HashMap<>();

        // 第一遍遍历：创建所有新节点，建立原节点到新节点的映射
        Node curr = head;
        while (curr != null) {
            map.put(curr, new Node(curr.val));
            curr = curr.next;
        }

        // 第二遍遍历：设置新节点的next和random指针
        curr = head;
        while (curr != null) {
            Node newNode = map.get(curr);
            newNode.next = map.get(curr.next);
            newNode.random = map.get(curr.random);
            curr = curr.next;
        }
        return map.get(head);
    }
    // 方法二：原地拷贝（空间复杂度O(1)）
    public static Node copyRandomList2(Node head) {
        if (head == null) {
            return null;
        }

        // 第一步：在每个原节点后插入拷贝节点
        Node curr = head;
        while (curr != null) {
            Node copy = new Node(curr.val);
            copy.next = curr.next;
            curr.next = copy;
            curr = copy.next;
        }

        // 第二步：设置拷贝节点的random指针
        curr = head;
        while (curr != null) {
            if (curr.random != null) {
                curr.next.random = curr.random.next;
            }
            curr = curr.next.next;
        }

        // 第三步：分离原链表和拷贝链表
        Node dummy = new Node(0);
        Node copyPrev = dummy;
        curr = head;

        while (curr != null) {
            Node next = curr.next.next;

            // 提取拷贝节点
            copyPrev.next = curr.next;
            copyPrev = copyPrev.next;

            // 恢复原链表
            curr.next = next;
            curr = next;
        }

        return dummy.next;
    }

    // 辅助方法：打印链表（用于测试）
    public static void printList(Node head) {
        Node curr = head;
        while (curr != null) {
            System.out.print("节点值: " + curr.val);
            if (curr.random != null) {
                System.out.print(", 随机指针指向: " + curr.random.val);
            } else {
                System.out.print(", 随机指针: null");
            }
            System.out.println();
            curr = curr.next;
        }
        System.out.println("----------");
    }

    public static void main(String[] args) {
        // 创建测试链表: 1 -> 2 -> 3 -> null
        Node node1 = new Node(1);
        Node node2 = new Node(2);
        Node node3 = new Node(3);

        node1.next = node2;
        node2.next = node3;

        // 设置随机指针
        node1.random = node3;  // 1的random指向3
        node2.random = node1;  // 2的random指向1
        node3.random = node2;  // 3的random指向2

        System.out.println("原链表:");
        printList(node1);

        // 测试方法一
        Node copy1 = copyRandomList1(node1);
        System.out.println("方法一拷贝结果:");
        printList(copy1);

        // 测试方法二
        Node copy2 = copyRandomList2(node1);
        System.out.println("方法二拷贝结果:");
        printList(copy2);
    }
}
